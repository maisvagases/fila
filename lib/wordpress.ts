import { HTTPError, fetchWithAuth } from './http';
import { API_CONFIG } from './config';

interface WordPressPost {
  title?: {
    rendered: string;
  };
}

export async function fetchWordPressTitle(url: string): Promise<string> {
  try {
    const response = await fetch(`${url}?_fields=title`, {
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
    return data.title?.rendered || 'Untitled Post';
  } catch (error) {
    console.error(`Error fetching WordPress title for ${url}:`, error);
    return 'Untitled Post';
  }
}