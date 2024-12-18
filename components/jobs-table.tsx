"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobPostDTO } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { calculateDurationInMinutes, formatToGMT3 } from "@/lib/utils/date";
import { ExternalLink, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface JobsTableProps {
  posts: JobPostDTO[];
}

export function JobsTable({ posts }: JobsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead key="image" className="w-[120px]">
              Image
            </TableHead>
            <TableHead key="title">Título</TableHead>
            <TableHead key="startTime" className="w-[180px]">
              Início (GMT-3)
            </TableHead>
            <TableHead key="endTime" className="w-[180px]">
              Fim (GMT-3)
            </TableHead>
            <TableHead key="duration" className="w-[100px] text-right">
              Duração
            </TableHead>
            <TableHead key="link" className="w-[70px]">
              Link
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                {post.imageUrl ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || "Post featured image"}
                      className="object-cover"
                      fill
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                    <Newspaper className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {post.error ? (
                  <span className="text-destructive">{post.error}</span>
                ) : (
                  <div className="flex flex-col">
                    <span>{post.title || "Untitled Post"}</span>
                    {post.type && (
                      <span className="text-xs text-muted-foreground">
                        {post.type === "job-listing" ? "Job Listing" : "Post"}
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {post.startTime ? formatToGMT3(post.startTime) : "Invalid date"}
              </TableCell>
              <TableCell>
                {post.finishedTime
                  ? formatToGMT3(post.finishedTime)
                  : "Invalid date"}
              </TableCell>
              <TableCell className="text-right">
                {post.startTime && post.finishedTime
                  ? `${calculateDurationInMinutes(
                      post.startTime,
                      post.finishedTime
                    )} min`
                  : "-"}
              </TableCell>
              <TableCell>
                <Link
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center justify-center text-muted-foreground hover:text-primary",
                    post.status === "error" && "pointer-events-none opacity-50"
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
