import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { fetchWordPressTitle } from '@/lib/wordpress';
import { API_CONFIG } from './config';

export interface JobPost {
  _id: string;
  url: string;
  startTime: string;
  finishedTime: string;
  title: string;
}

const API_URL = 'https://maisvagases.com.br/wp-json/wp/v2/job-listings';

export async function getPaginatedJobPosts(page: number, pageSize: number) {
  try {
    const response = await fetch(`${API_URL}?page=${page}&per_page=${pageSize}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Adaptar os dados conforme necessário
    const adaptedPosts = data.map((post: any) => ({
      id: post.id,
      title: post.title.rendered,
      url: post.link,
      startTime: post.date,
      finishedTime: post.modified,
      imageUrl: post.featured_media ? post._embedded['wp:featuredmedia'][0].source_url : null,
      imageAlt: post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].alt_text : null,
      meta: {
        _company_name: post.meta?._company_name,
      },
    }));

    return {
      posts: adaptedPosts,
      total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    };
  } catch (error) {
    console.error('Error fetching job posts:', error);
    throw error;
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
          title: title || 'Untitled Post'
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