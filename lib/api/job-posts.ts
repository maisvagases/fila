import { fetchJobPosts as fetchJobPostsFromAPI } from './fetch-job-posts';
import { fetchWordPressPost } from './services/wordpress';
import type { JobPost, JobPostDTO } from '@/lib/types/job-post';

export { fetchJobPostsFromAPI as fetchJobPosts };

export async function getEnrichedJobPosts(): Promise<JobPostDTO[]> {
  try {
    console.log('Fetching raw posts...');
    const posts = await fetchJobPostsFromAPI();
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
          imageUrl: wpData.imageUrl || null,
          imageAlt: wpData.imageAlt || '',
          status: wpData.error ? 'error' as const : 'success' as const,
          error: wpData.error || 'No error details',
          type: wpData.type,
          companyName: ['job-listing', 'job_listing'].includes(wpData.type || '') 
            ? (wpData.meta?._company_name || wpData.companyName || 'Empresa não identificada')
            : 'tipo Post'
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
      console.error('Rejected promise:', result.reason);
      return null;
    })
    .filter((post): post is JobPostDTO => 
      post !== null && 
      post.imageUrl !== null &&
      post.imageAlt !== null &&
      (post.type === 'post' || post.type === 'job-listing' || post.type === 'job_listing')
    )
    .sort((a, b) => {
      if (a && b) {
        return b.startTime.getTime() - a.startTime.getTime();
      }
      return 0; // ou outra lógica de fallback
    });

  console.log(`Finalização do enriquecimento. Posts válidos: ${validPosts.length} de ${posts.length}`);

  return validPosts as JobPostDTO[];
}

export async function getPaginatedJobPosts(page: number, pageSize: number) {
  try {
    const allPosts = await getEnrichedJobPosts();
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = allPosts.slice(startIndex, endIndex).filter(post => post !== null);

    return {
      posts: paginatedPosts as JobPostDTO[],
      total: allPosts.length,
      page,
      pageSize,
      totalPages: Math.ceil(allPosts.length / pageSize)
    };
  } catch (error) {
    console.error('Error in getPaginatedJobPosts:', error);
    throw error;
  }
}