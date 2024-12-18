import { API_CONFIG } from '@/lib/config';
import { HTTPError } from '@/lib/utils/http';
import { sanitizeWordPressContent } from '@/lib/utils/wordpress';
import type { WordPressPost, WordPressPostData, WordPressMedia } from '../types/wordpress';

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
  try {
    const postId = url.split('?p=')[1];
    console.log(`Fetching post with URL: ${url}, Extracted postId: ${postId}`);

    if (!postId) {
      console.warn('Invalid URL: Could not extract post ID');
      return {
        title: `Post ${postId || 'Unknown'}`, // Fallback para título
        error: 'Could not extract post ID from URL'
      };
    }

    // Try job listing endpoint first
    let response = await fetchFromEndpoint(ENDPOINTS.JOB_LISTING(postId));
    console.log(`Job Listing Endpoint Response Status: ${response.status}`);
    
    // If not found, try regular post endpoint
    if (response.status === 404) {
      response = await fetchFromEndpoint(ENDPOINTS.POST(postId));
      console.log(`Post Endpoint Response Status: ${response.status}`);
    }

    if (!response.ok) {
      console.warn(`Failed to fetch post: ${response.statusText}`);
      return {
        title: `Post ${postId}`, // Fallback para título
        error: `Failed to fetch post: ${response.statusText}`,
        type: undefined
      };
    }

    const data: WordPressPost = await response.json();
    console.log('Fetched Post Data:', JSON.stringify(data, null, 2));

    let media = null;
    
    if (data.featured_media) {
      media = await fetchMedia(data.featured_media);
      console.log('Media:', media);
    }
    
    const title = data.title?.rendered 
      ? sanitizeWordPressContent(data.title.rendered) 
      : `Post ${postId}`; // Fallback para título usando o ID do post
    
    console.log(`Final Title: ${title}`);

    return {
      title,
      imageUrl: media?.source_url,
      imageAlt: media?.alt_text,
      type: response.url.includes('job-listings') ? 'job-listing' : 'post'
    };
  } catch (error) {
    console.error(`Error fetching WordPress title for ${url}:`, error);
    return {
      title: error instanceof HTTPError 
        ? `Error: ${error.message}` 
        : `Error loading post ${url.split('?p=')[1] || 'Unknown'}`,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}