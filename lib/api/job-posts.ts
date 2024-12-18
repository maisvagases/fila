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
      try {
        const wpData = await fetchWordPressPost(post.url);
        
        return {
          _id: post._id.$oid,
          url: post.url,
          startTime: new Date(post.startTime.$date),
          finishedTime: new Date(post.finishedTime.$date),
          title: wpData.title,
          imageUrl: wpData.imageUrl,
          imageAlt: wpData.imageAlt,
          status: wpData.error ? 'error' : 'success',
          error: wpData.error
        };
      } catch (error) {
        console.error(`Error enriching post ${post._id.$oid}:`, error);
        return {
          _id: post._id.$oid,
          url: post.url,
          startTime: new Date(post.startTime.$date),
          finishedTime: new Date(post.finishedTime.$date),
          title: 'Error loading post',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  return enrichedPosts
    .map(result => result.status === 'fulfilled' ? result.value : null)
    .filter((post): post is JobPostDTO => post !== null)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}