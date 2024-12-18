'use client'
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Application error:', error);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold">Something went wrong!</h2>
        <p className="mb-4 text-muted-foreground">
          {error.message || 'Failed to load job posts'}
        </p>
        <Button
          onClick={reset}
          variant="default"
          className="inline-flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}