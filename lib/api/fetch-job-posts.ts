import { fetchWithAuth } from '@/lib/utils/http';
import type { JobPost } from '@/lib/types/job-post';

export async function fetchJobPosts(): Promise<JobPost[]> {
  try {
    const url = 'https://whatsbot2.xwhost.com.br/db/telegram_bot/expArr/send_logs';
    console.log('Fetching posts from:', url);
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format: expected an array');
    }

    console.log('Raw data from MongoDB:', {
      totalItems: data.length,
      firstItem: data[0],
      lastItem: data[data.length - 1]
    });

    // Validação menos restritiva
    const validPosts = data.filter((item): item is JobPost => {
      const isValid = 
        item?._id?.$oid &&        // Verifica se tem ID válido
        item?.url &&              // Verifica se tem URL
        item?.startTime?.$date && // Verifica se tem data de início
        item?.finishedTime?.$date; // Verifica se tem data de fim

      if (!isValid) {
        console.warn('Invalid post structure:', item);
      }

      return isValid;
    });

    console.log('Posts validation:', {
      total: data.length,
      valid: validPosts.length,
      invalid: data.length - validPosts.length
    });

    return validPosts;
  } catch (error) {
    console.error('Failed to fetch job posts:', error);
    throw error;
  }
}