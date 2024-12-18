import { fetchJobPosts } from './fetch-job-posts';
import { fetchWordPressPost } from './services/wordpress';
import type { JobPost, JobPostDTO } from '@/lib/types/job-post';

export async function getEnrichedJobPosts(): Promise<JobPostDTO[]> {
  const posts = await fetchJobPosts();
  return await enrichPostsWithWordPressData(posts);
}

async function enrichPostsWithWordPressData(posts: JobPost[]): Promise<JobPostDTO[]> {
  const enrichedPosts = await Promise.allSettled(
    posts.map(async post => {
      console.log(`Processing post URL: ${post.url}`);
      try {
        const wpData = await fetchWordPressPost(post.url);
        console.log('WP Data:', JSON.stringify(wpData, null, 2));
        
        return {
          id: post._id.$oid,
          url: post.url,
          startTime: new Date(post.startTime.$date),
          finishedTime: new Date(post.finishedTime.$date),
          title: wpData.title || `Post ${post._id.$oid.slice(-6)}`, // Fallback para título
          imageUrl: wpData.imageUrl,
          imageAlt: wpData.imageAlt,
          status: wpData.error ? 'error' : 'success',
          error: wpData.error || 'No error details', // Sempre uma string
          type: wpData.type
        };
      } catch (error) {
        console.error(`Error enriching post ${post._id.$oid}:`, error);
        return {
          id: post._id.$oid,
          url: post.url,
          startTime: new Date(post.startTime.$date),
          finishedTime: new Date(post.finishedTime.$date),
          title: `Post ${post._id.$oid.slice(-6)}`, // Fallback para título
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error', // Sempre uma string
          type: undefined
        };
      }
    })
  );

  return enrichedPosts
    .filter((result): result is PromiseFulfilledResult<JobPostDTO> => {
      return result.status === 'fulfilled' && 
             typeof result.value.id === 'string' &&
             typeof result.value.title === 'string' &&
             typeof result.value.status === 'string' &&
             typeof result.value.error === 'string';
    })
    .map(result => result.value)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

export async function getPaginatedJobPosts(page: number, pageSize: number) {
  try {
    const allPosts = await getEnrichedJobPosts();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      posts: allPosts.slice(startIndex, endIndex),
      total: allPosts.length,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Error in getPaginatedJobPosts:', error);
    throw error;
  }
}