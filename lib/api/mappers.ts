import type { JobPostDTO } from './types';
import { fetchWordPressPost } from '@/lib/services/wordpress';
import { parseMongoDate } from '@/lib/utils/date';

export async function mapAPIResponseToDTO(data: any): Promise<JobPostDTO> {
  try {
    const id = data._id?.$oid || data._id;
    if (!id || !data.url) {
      throw new Error('Missing required fields');
    }

    let postData;
    try {
      postData = await fetchWordPressPost(data.url);
      if (!postData.title) {
        throw new Error('Failed to fetch post title');
      }
    } catch (error) {
      console.warn(`Failed to fetch title for ${data.url}:`, error);
      postData = {
        title: 'Error loading post',
        imageUrl: undefined,
        imageAlt: undefined
      };
    }

    return {
      id: id,
      url: String(data.url),
      startTime: parseMongoDate(data.startTime || data.start_time),
      finishedTime: parseMongoDate(data.finishedTime),
      title: postData.title,
      imageUrl: postData.imageUrl ?? undefined,
      imageAlt: postData.imageAlt ?? undefined,
      status: postData.title === 'Error loading post' ? 'error' : 'success',
      error: '',
      companyName: postData.meta?._company_name || 'tipo Post'
    };
  } catch (error) {
    console.error('Error mapping job post:', error);
    return {
      id: data.id || 'error',
      url: data.url || '#',
      startTime: new Date(),
      finishedTime: new Date(),
      title: 'Error: Invalid Data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      companyName: 'tipo Post'
    };
  }
}