import { fetchWithAuth } from '@/lib/utils/http';
import type { JobPost } from '@/lib/types/job-post';

export async function fetchJobPosts(): Promise<JobPost[]> {
  try {
    const url = 'https://whatsbot2.xwhost.com.br/db/telegram_bot/expArr/send_logs';
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array');
    }

    console.log(`Fetched ${data.length} posts from API at ${new Date().toISOString()}`);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch job posts:', error);
    throw error;
  }
}