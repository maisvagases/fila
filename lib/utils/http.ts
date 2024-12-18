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

export async function fetchWithAuth(url: string): Promise<Response> {
  // Credenciais temporárias - APENAS PARA DESENVOLVIMENTO
  const username = 'UcTjKKp6'; // Substitua pela sua credencial
  const password = 'Tx2uwwFX';  // Substitua pela sua credencial

  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  return fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}