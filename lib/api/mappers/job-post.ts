import type { JobPostDTO } from '@/lib/api/types';
import { parseMongoDate } from '@/lib/utils/date';
import type { JobPost } from '../../types/job-post';

export async function mapAPIResponseToDTO(data: JobPost): Promise<JobPostDTO> {
  try {
    const id = data._id?.$oid;
    if (!id || !data.url) {
      throw new Error('Missing required fields');
    }

    return {
      id,
      url: String(data.url),
      startTime: parseMongoDate(data.startTime),
      finishedTime: parseMongoDate(data.finishedTime),
      title: 'Some Title',
      status: 'success',
      error: '',
    };
  } catch (error) {
    console.error('Error mapping job post:', error);
    return {
      id: 'error',
      url: '#',
      startTime: new Date(),
      finishedTime: new Date(),
      title: 'Error: Invalid Data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}