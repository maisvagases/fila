import { API_CONFIG } from '@/lib/config';
import { HTTPError } from '@/lib/utils/http';
import { sanitizeWordPressContent } from '@/lib/utils/wordpress';

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

interface WordPressPost {
  title?: {
    rendered: string;
  },
  featured_media?: number;
  meta?: {
    _company_name?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
}

interface WordPressMedia {
  source_url?: string;
  alt_text?: string;
}
export interface WordPressPostData {
  title: string;
  imageUrl: string | null;
  imageAlt: string;
  companyName: string;
  error?: string;
  type?: 'post' | 'job-listing' | 'job_listing';
  meta?: {
    _company_name?: string;
  };
}

export async function fetchWordPressPost(url: string): Promise<WordPressPostData> {
  try {
    console.log('Attempting to fetch WordPress post for URL:', url);
    
    // Extrair o ID da URL de forma mais flexível
    const postIdMatch = url.match(/[?&]p=(\d+)/) || url.match(/\/(\d+)\/?$/);
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
      } as WordPressPostData;
    }

    // Tentar múltiplos endpoints
    const endpoints = [
      `https://maisvagases.com.br/wp-json/wp/v2/job-listings/${postId}?_embed`,
      `https://maisvagases.com.br/wp-json/wp/v2/posts/${postId}?_embed`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          next: { revalidate: 3600 }, // cache por 1 hora
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; JobPostManager/1.0)',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const featuredMedia = data._embedded?.['wp:featuredmedia']?.[0];
          
          console.log('Successful fetch:', {
            title: data.title?.rendered,
            featuredMedia: !!featuredMedia
          });

          return {
            title: data.title?.rendered 
              ? sanitizeWordPressContent(data.title.rendered) 
              : `Post ${postId}`,
            imageUrl: featuredMedia?.source_url || null,
            imageAlt: featuredMedia?.alt_text || '',
            companyName: data.meta?._company_name || 'Desconhecido',
            error: '',
            type: response.url.includes('job-listings') ? 'job-listing' : 'post',
            meta: data.meta || {}
          };
        }
      } catch (endpointError) {
        console.warn(`Error with endpoint ${endpoint}:`, endpointError);
      }
    }

    // Se nenhum endpoint funcionar
    console.error(`Failed to fetch post for URL: ${url}`);
    return {
      title: `Post ${postId}`,
      imageUrl: null,
      imageAlt: '',
      companyName: 'Desconhecido',
      error: 'Could not fetch post from any endpoint',
      type: 'post',
      meta: {}
    } as WordPressPostData;
  } catch (error) {
    console.error(`Comprehensive error fetching WordPress post for ${url}:`, error);
    return {
      title: `Error Post`,
      imageUrl: null,
      imageAlt: '',
      companyName: 'Erro',
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'post',
      meta: {}
    } as WordPressPostData;
  }
}