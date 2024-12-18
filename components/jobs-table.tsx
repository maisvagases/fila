"use client";

import { useState, useEffect } from 'react';
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
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SearchFilter, type SearchFilters } from './search-filter';
import { PageSizeSelector } from './ui/page-size-selector';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface JobsTableProps {
  initialPosts: JobPostDTO[];
  totalPosts: number;
}

export function JobsTable({ initialPosts, totalPosts }: JobsTableProps) {
  const [posts, setPosts] = useState<JobPostDTO[]>(initialPosts);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(totalPosts / pageSize);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/posts?page=${currentPage}&pageSize=${pageSize}`
        );
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentPage > 1) {
      fetchPageData();
    }
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="mb-6">
        <SearchFilter onFilterChange={setFilters} />
      </div>

      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
            <div className="animate-spin">
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

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
                    <div className="flex flex-col">
                      <span>{post.title}</span>
                      {post.error !== 'No error details' && (
                        <span className="text-xs text-muted-foreground">{post.error}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span>{post.title}</span>
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

      <div className="mt-4 flex items-center justify-between">
        <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-4">
            Mostrando {((currentPage - 1) * pageSize) + 1} até {Math.min(currentPage * pageSize, totalPosts)} de {totalPosts} registros
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const distance = Math.abs(page - currentPage);
                return distance === 0 || distance === 1 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return [
                    <span key={`ellipsis-${page}`} className="px-2">...</span>,
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ];
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
