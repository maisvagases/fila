import { JobsTable } from '@/components/jobs-table';
import { getEnrichedJobPosts } from '@/lib/api/job-posts';
import { History, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import type { JobPostDTO } from '@/lib/api/types';

export default async function Home() {
  let posts: JobPostDTO[] = []; // Adicione a tipagem aqui
  let error = null;

  try {
    posts = await getEnrichedJobPosts();
  } catch (e) {
    error = e instanceof Error ? e : new Error('Failed to fetch posts');
    console.error('Error fetching posts:', e);
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Histórico de postagens</h1>
        </div>
        <form action={async () => {
          'use server';
          await getEnrichedJobPosts();
        }}>
          <Button type="submit" variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </form>
      </div>
      
      <div className="relative">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          }
        >
          {error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-destructive">
              <AlertCircle className="h-12 w-12" />
              <p className="text-lg">Error loading job posts</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : posts.length > 0 ? (
            <JobsTable posts={posts} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12" />
              <p className="text-lg">No job posts found</p>
              <p className="text-sm">Try refreshing the page or check back later</p>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  );
}