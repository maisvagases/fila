import { JobsTable } from '@/components/jobs-table';
import { getPaginatedJobPosts } from '@/lib/api/job-posts';
import type { JobPostDTO } from '@/lib/api/types';
import { AlertCircle, History } from 'lucide-react';
import { RefreshButton } from '@/components/refresh-button';

interface PaginatedData {
  posts: JobPostDTO[];
  total: number;
}

export const revalidate = 60; // 60 segundos = 1 minuto

export default async function Home() {
  let error = null;
  let initialData: PaginatedData = { posts: [], total: 0 };
  const now = new Date();

  try {
    initialData = await getPaginatedJobPosts(1, 10);
  } catch (e) {
    error = e instanceof Error ? e : new Error('Failed to fetch posts');
    console.error('Error fetching posts:', e);
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Histórico de envios</h1>
          </div>
        </div>
        <RefreshButton />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-destructive">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg">Error loading job posts</p>
          <p className="text-sm">{error.message}</p>
        </div>
      ) : initialData.posts.length > 0 ? (
        <JobsTable
          initialPosts={initialData.posts}
          totalPosts={initialData.total}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg">No job posts found</p>
          <p className="text-sm">Try refreshing the page or check back later</p>
        </div>
      )}
    </main>
  );
}