import type { JobPostDTO, JobPostResponse } from '../types/job-post';
import { fetchWordPressPost } from '@/lib/services/wordpress';
import { parseMongoDate } from '@/lib/utils/date';

export async function mapAPIResponseToDTO(data: JobPostResponse): Promise<JobPostDTO> {
  try {
    const id = data._id?.$oid;
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
      _id: id,
      url: String(data.url),
      startTime: parseMongoDate(data.startTime),
      finishedTime: parseMongoDate(data.finishedTime),
      title: postData.title,
      imageUrl: postData.imageUrl,
      imageAlt: postData.imageAlt,
      status: postData.title === 'Error loading post' ? 'error' : 'success'
    };
  } catch (error) {
    console.error('Error mapping job post:', error);
    return {
      _id: data._id?.$oid || 'error',
      url: data.url || '#',
      startTime: new Date(),
      finishedTime: new Date(),
      title: 'Error: Invalid Data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}