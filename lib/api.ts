import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { fetchWordPressTitle } from '@/lib/wordpress';
import { prisma } from '@/lib/prisma';
import { API_CONFIG } from './config';

export interface JobPost {
  _id: string;
  url: string;
  startTime: string;
  finishedTime: string;
  title?: string;
}

export async function fetchJobPosts(): Promise<JobPost[]> {
  try {
    const posts = await prisma.jobPost.findMany({
      orderBy: {
        startTime: 'desc'
      },
      take: 50 // Limit to most recent 50 posts
    });

    return await enrichPostsWithTitles(
      posts.map(post => ({
        _id: post.id,
        url: post.url,
        startTime: post.startTime.toISOString(),
        finishedTime: post.finishedTime.toISOString(),
        title: post.title
      }))
    );
  } catch (error) {
    console.error('Failed to fetch job posts:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to fetch job posts: ${error.message}`
        : 'Failed to fetch job posts'
    );
  }
}

async function enrichPostsWithTitles(posts: JobPost[]): Promise<JobPost[]> {
  if (!Array.isArray(posts)) {
    throw new Error('Invalid response format: expected an array of posts');
  }

  const postsWithTitles = await Promise.allSettled(
    posts.map(async (post) => {
      try {
        if (!post.url) {
          throw new Error('Post URL is missing');
        }

        const title = await fetchWordPressTitle(post.url);
        return {
          ...post,
          title
        };
      } catch (error) {
        console.error(`Error fetching title for ${post?.url || 'unknown URL'}:`, error);
        return { ...post, title: 'Untitled Post' };
      }
    })
  );

  const validPosts = postsWithTitles
    .map(result => result.status === 'fulfilled' ? result.value : null)
    .filter((post): post is JobPost => post !== null);

  return validPosts.sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export function formatDateTime(isoString: string): string {
  const date = utcToZonedTime(new Date(isoString), API_CONFIG.TIME_ZONE);
  return format(date, "dd/MM/yyyy HH:mm:ss");
}