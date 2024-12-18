import { API_CONFIG } from '@/lib/config/api';

export class HTTPError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'HTTPError';
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const auth = Buffer.from(
    `${API_CONFIG.CREDENTIALS.username}:${API_CONFIG.CREDENTIALS.password}`
  ).toString('base64');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
      next: { 
        revalidate: API_CONFIG.REVALIDATION.posts
      }
    });

    if (!response.ok) {
      throw new HTTPError(
        'API request failed',
        response.status,
        response.statusText
      );
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch data');
  }
}