'use client';

import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <form action={async () => {
      setIsRefreshing(true);
      try {
        'use server';
        await fetch('/api/posts?page=1&pageSize=10', { 
          method: 'GET',
          cache: 'no-store'
        });
      } finally {
        setIsRefreshing(false);
      }
    }}>
      <Button 
        type="submit" 
        variant="outline" 
        size="sm" 
        className="gap-2" 
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Atualizar
      </Button>
    </form>
  );
}