import { getPaginatedJobPosts } from '@/lib/api/job-posts';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.max(1, Number(searchParams.get('pageSize')) || 10);

    console.log(`API Route - Fetching page ${page} with size ${pageSize}`);

    const result = await getPaginatedJobPosts(page, pageSize);
    
    if (!result || !Array.isArray(result.posts)) {
      console.error('Invalid result structure:', result);
      throw new Error('Invalid data structure returned from getPaginatedJobPosts');
    }

    console.log(`API Route - Found ${result.posts.length} posts out of ${result.total}`);

    // Garantir que as datas são strings ISO
    const serializedPosts = result.posts.map(post => ({
      ...post,
      startTime: post.startTime instanceof Date 
        ? post.startTime.toISOString() 
        : new Date(post.startTime).toISOString(),
      finishedTime: post.finishedTime instanceof Date 
        ? post.finishedTime.toISOString() 
        : new Date(post.finishedTime).toISOString()
    }));

    return Response.json({
      posts: serializedPosts,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error in API route:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
} 