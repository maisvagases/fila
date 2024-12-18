const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

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
  const auth = Buffer.from('UcTjKKp6:Tx2uwwFX').toString('base64');

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...options.headers,
        },
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
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${attempt} failed:`, lastError);

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}