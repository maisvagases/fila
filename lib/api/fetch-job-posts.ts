import { API_CONFIG } from '@/lib/config/api';
import { JobPost } from '@/lib/types/job-post';
import { fetchWithAuth } from '@/lib/utils/http';

export async function fetchJobPosts(): Promise<JobPost[]> {
  try {
    const response = await fetchWithAuth(
      `${API_CONFIG.BASE_URL}/expArr/send_logs`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch job posts:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch job posts');
  }
}