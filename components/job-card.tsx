import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { JobPostDTO } from "@/lib/api/types";
import { formatDateTime } from "@/lib/api";
import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface JobCardProps {
  post: JobPostDTO;
}

export function JobCard({ post }: JobCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      post.status === 'error' && "border-destructive"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="line-clamp-1 flex items-center gap-2">
            {post.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            {post.title}
          </span>
          <Link
            href={post.url}
            target="_blank"
            className={cn(
              "text-muted-foreground hover:text-primary",
              post.status === 'error' && "pointer-events-none opacity-50"
            )}
          >
            <ExternalLink className="h-5 w-5" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {post.error ? (
            <CardDescription className="text-destructive">{post.error}</CardDescription>
          ) : (
            <>
              <CardDescription>
                <span className="font-medium">URL:</span>{' '}
                <Link href={post.url} className="text-primary hover:underline" target="_blank">
                  {new URL(post.url).pathname}
                </Link>
              </CardDescription>
              <CardDescription>
                <span className="font-medium">Started:</span> {formatDateTime(post.startTime.toString())}
              </CardDescription>
              <CardDescription>
                <span className="font-medium">Finished:</span> {formatDateTime(post.finishedTime.toString())}
              </CardDescription>
              <CardDescription>
                <span className="font-medium">Duration:</span>{' '}
                {Math.round((new Date(post.finishedTime).getTime() - new Date(post.startTime).getTime()) / 1000)} seconds
              </CardDescription>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}