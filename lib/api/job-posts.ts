import { fetchJobPosts } from './fetch-job-posts';
import { fetchWordPressPost } from './services/wordpress';
import type { JobPost, JobPostDTO } from '@/lib/types/job-post';

export async function getEnrichedJobPosts(): Promise<JobPostDTO[]> {
  try {
    console.log('Fetching raw posts...');
    const posts = await fetchJobPosts();
    console.log(`Fetched ${posts.length} raw posts`);

    if (posts.length === 0) {
      console.warn('No posts returned from fetchJobPosts');
      return [];
    }

    const enrichedPosts = await enrichPostsWithWordPressData(posts);
    console.log(`Enriched ${enrichedPosts.length} posts out of ${posts.length}`);

    if (enrichedPosts.length !== posts.length) {
      console.warn(`Lost ${posts.length - enrichedPosts.length} posts during enrichment`);
    }

    return enrichedPosts;
  } catch (error) {
    console.error('Error in getEnrichedJobPosts:', error);
    throw error;
  }
}

async function enrichPostsWithWordPressData(posts: JobPost[]): Promise<JobPostDTO[]> {
  console.log(`Starting enrichment of ${posts.length} posts`);
  
  const enrichedPosts = await Promise.allSettled(
    posts.map(async post => {
      try {
        const wpData = await fetchWordPressPost(post.url);
        
        return {
          id: post._id.$oid,
          url: post.url,
          startTime: new Date(post.startTime.$date),
          finishedTime: new Date(post.finishedTime.$date),
          title: wpData.title || `Post ${post._id.$oid.slice(-6)}`,
          imageUrl: wpData.imageUrl,
          imageAlt: wpData.imageAlt,
          status: wpData.error ? 'error' as const : 'success' as const,
          error: wpData.error || 'No error details',
          type: wpData.type
        };
      } catch (error) {
        console.error(`Error enriching post ${post._id.$oid}:`, error);
        // Mesmo com erro, retornamos o post com dados básicos
        return {
          id: post._id.$oid,
          url: post.url,
          startTime: new Date(post.startTime.$date),
          finishedTime: new Date(post.finishedTime.$date),
          title: `Post ${post._id.$oid.slice(-6)}`,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'post'
        };
      }
    })
  );

  // Log para debug
  console.log('Enrichment results:', {
    total: posts.length,
    settled: enrichedPosts.length,
    fulfilled: enrichedPosts.filter(r => r.status === 'fulfilled').length,
    rejected: enrichedPosts.filter(r => r.status === 'rejected').length
  });

  const validPosts = enrichedPosts
    .map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      // Se rejeitado, log do erro e retorna null
      console.error('Rejected promise:', result.reason);
      return null;
    })
    .filter((post): post is JobPostDTO => post !== null)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  console.log(`Enrichment complete. Valid posts: ${validPosts.length} out of ${posts.length}`);

  return validPosts;
}

export async function getPaginatedJobPosts(page: number, pageSize: number) {
  try {
    console.log('Getting all posts without pagination...');
    const allPosts = await getEnrichedJobPosts();
    
    console.log(`Total posts available: ${allPosts.length}`);
    
    // Retornar todos os posts sem paginação
    return {
      posts: allPosts, // Retorna todos os posts ao invés de fatiar
      total: allPosts.length,
      page: 1,
      pageSize: allPosts.length,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error in getPaginatedJobPosts:', error);
    throw error;
  }
}