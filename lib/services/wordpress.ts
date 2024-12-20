import { API_CONFIG } from '@/lib/config';
import { HTTPError } from '@/lib/utils/http';
import { sanitizeWordPressContent } from '@/lib/utils/wordpress';
import type { WordPressPost, WordPressPostData, WordPressMedia } from '@/lib/api/types/wordpress';

const ENDPOINTS = {
  POST: (id: string) => `https://maisvagases.com.br/wp-json/wp/v2/posts/${id}`,
  JOB_LISTING: (id: string) => `https://maisvagases.com.br/wp-json/wp/v2/job-listings/${id}`,
  MEDIA: (id: number) => `https://maisvagases.com.br/wp-json/wp/v2/media/${id}`
} as const;

async function fetchFromEndpoint(url: string): Promise<Response> {
  return fetch(url, {
    next: { revalidate: API_CONFIG.REVALIDATION.wordpress },
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobPostManager/1.0)',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

async function fetchMedia(mediaId: number): Promise<WordPressMedia | null> {
  try {
    const response = await fetchFromEndpoint(ENDPOINTS.MEDIA(mediaId));
    
    if (!response.ok) {
      console.warn(`Failed to fetch media ${mediaId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return {
      source_url: data.source_url,
      alt_text: data.alt_text
    };
  } catch (error) {
    console.warn(`Error fetching media ${mediaId}:`, error);
    return null;
  }
}

export async function fetchWordPressPost(url: string): Promise<WordPressPostData> {
  const postIdMatch = url.match(/\/(\d+)(?:\/|$)/);
  const postId = postIdMatch ? postIdMatch[1] : null;

  if (!postId) {
    console.warn('Invalid URL: Could not extract post ID');
    return {
      title: `Post ${postId || 'Unknown'}`,
      imageUrl: null,
      imageAlt: '',
      companyName: 'Desconhecido',
      error: 'Could not extract post ID from URL',
      type: 'post',
      meta: {}
    };
  }

  // Tentar múltiplos endpoints
  const endpoints = [
    `https://maisvagases.com.br/wp-json/wp/v2/posts/${postId}?_embed`,
    `https://maisvagases.com.br/wp-json/wp/v2/job_listing/${postId}?_embed`
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        next: { revalidate: 960 }, // cache por 16 minutos
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JobPostManager/1.0)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`Endpoint failed: ${endpoint}`);
        continue;
      }

      const post: WordPressPost = await response.json();
      
      // Extrair imagem
      let imageUrl: string | null = null;
      let imageAlt = '';
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        imageUrl = media.source_url || 
          media.media_details?.sizes?.full?.source_url || 
          media.media_details?.sizes?.medium?.source_url || 
          null;
        imageAlt = media.alt_text || '';
      }

      // Extrair nome da empresa
      const companyName = post.meta?._company_name || 
        post._embedded?.['wp:term']?.find(term => term.taxonomy === 'company')?.name || 
        'Desconhecido';

      return {
        title: post.title.rendered,
        imageUrl,
        imageAlt,
        type: post.type === 'job_listing' ? 'job_listing' : 'post',
        companyName,
        error: '',
        meta: post.meta
      };
    } catch (error) {
      console.error(`Error fetching post from ${endpoint}:`, error);
    }
  }

  // Se nenhum endpoint funcionar
  return {
    title: 'Erro ao buscar post',
    imageUrl: null,
    imageAlt: '',
    companyName: 'Desconhecido',
    error: 'Could not fetch post from any endpoint',
    type: 'post',
    meta: {}
  };
}