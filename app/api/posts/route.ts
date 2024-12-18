import { getPaginatedJobPosts } from '@/lib/api/job-posts';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  try {
    const { posts, total } = await getPaginatedJobPosts(page, pageSize);
    
    return NextResponse.json({
      posts,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 