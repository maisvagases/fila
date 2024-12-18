import type { JobPostResponse } from '../types/job-post';
import { fetchWordPressPost } from '@/lib/api/services/wordpress';
import { parseMongoDate } from '@/lib/utils/date';
import type { JobPostDTO } from '@/lib/api/types';

export async function mapAPIResponseToDTO(data: JobPostResponse): Promise<JobPostDTO> {
  try {
    const id = data._id?.$oid;
    if (!id || !data.url) {
      throw new Error('Missing required fields');
    }

    let postData;
    try {
      postData = await fetchWordPressPost(data.url);
    } catch (error) {
      console.warn(`Failed to fetch WordPress data for ${data.url}:`, error);
      postData = {
        title: undefined,
        imageUrl: undefined,
        imageAlt: undefined,
        type: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch post data'
      };
    }

    // Se não tiver título do WordPress, tenta extrair do URL
    let title = postData.title;
    if (!title) {
      try {
        const url = new URL(data.url);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        title = pathSegments[pathSegments.length - 1]
          ?.replace(/-/g, ' ')
          ?.replace(/\b\w/g, c => c.toUpperCase()); // Capitaliza primeira letra de cada palavra
      } catch {
        title = `Post ${id.slice(-6)}`; // Fallback para ID se URL for inválida
      }
    }

    return {
      id,
      url: String(data.url),
      startTime: parseMongoDate(data.startTime),
      finishedTime: parseMongoDate(data.finishedTime),
      title,
      imageUrl: postData.imageUrl,
      imageAlt: postData.imageAlt,
      status: postData.error ? 'error' : 'success',
      error: postData.error && postData.error !== 'No error details' ? postData.error : ''
    };
  } catch (error) {
    console.error('Error mapping job post:', error);
    return {
      id: data._id?.$oid || 'error',
      url: data.url || '#',
      startTime: new Date(),
      finishedTime: new Date(),
      title: 'Error: Invalid Data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}