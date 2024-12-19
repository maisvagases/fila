import { HTTPError } from '@/lib/utils/http';
import { sanitizeWordPressContent } from '@/lib/utils/wordpress';
import { API_CONFIG } from '@/lib/config';

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

export interface WordPressPostData {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  companyName?: string;
}

export async function fetchWordPressPost(url: string): Promise<WordPressPostData> {
  try {
    const response = await fetch(`${url}?_embed&_fields=title,featured_media,meta`, {
      next: { revalidate: API_CONFIG.REVALIDATION.wordpress },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobPostManager/1.0)',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      throw new HTTPError('WordPress API request failed', response.status);
    }

    const data: WordPressPost = await response.json();
    const featuredMedia = data._embedded?.['wp:featuredmedia']?.[0];
    
    return {
      title: data.title?.rendered ? sanitizeWordPressContent(data.title.rendered) : 'Untitled Post',
      imageUrl: featuredMedia?.source_url,
      imageAlt: featuredMedia?.alt_text,
      companyName: data.meta?._company_name
    };
  } catch (error) {
    console.error(`Error fetching WordPress title for ${url}:`, error);
    return {
      title: 'Untitled Post'
    };
  }
}