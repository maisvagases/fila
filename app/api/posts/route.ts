import { getPaginatedJobPosts } from '@/lib/api/job-posts';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    const { posts, total } = await getPaginatedJobPosts(page, pageSize);

    return Response.json({
      posts,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 