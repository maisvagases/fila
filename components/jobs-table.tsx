"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from '@/lib/api/date-utils';
import type { JobPostDTO } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { calculateDurationInMinutes } from "@/lib/utils/date";
import { ExternalLink, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { SearchFilter, SearchFilters } from './search-filter';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { TableSkeleton } from './table-skeleton';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface JobsTableProps {
  initialPosts: JobPostDTO[];
  totalPosts: number;
}

export function JobsTable({ initialPosts, totalPosts }: JobsTableProps) {
  const [posts, setPosts] = useState<JobPostDTO[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    title: '',
    url: '',
    dateRange: undefined,
    company: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: Math.ceil(totalPosts / 10),
    total: totalPosts
  });
  const [allPosts, setAllPosts] = useState<JobPostDTO[]>(initialPosts);
  const [error, setError] = useState<string | null>(null);

  // Function to generate visible page numbers
  const getVisiblePages = (current: number, total: number) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];

    return [current - 2, current - 1, current, current + 1, current + 2];
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/posts?page=1&pageSize=1000');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllPosts(data.posts);
      applyFiltersAndPagination(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndPagination = (posts: JobPostDTO[]) => {
    // Apply filters
    const filtered = posts.filter(post => {
      const matchesTitle = post.title.toLowerCase().includes(filters.title.toLowerCase());
      const matchesUrl = post.url.toLowerCase().includes(filters.url.toLowerCase());
      const matchesCompany = filters.company
        ? post.companyName.toLowerCase().includes(filters.company.toLowerCase())
        : true;

      const matchesDateRange = filters.dateRange
        ? (filters.dateRange.from && filters.dateRange.to
          ? isWithinInterval(new Date(post.startTime), {
            start: startOfDay(filters.dateRange.from),
            end: endOfDay(filters.dateRange.to)
          }) ||
          isWithinInterval(new Date(post.finishedTime), {
            start: startOfDay(filters.dateRange.from),
            end: endOfDay(filters.dateRange.to)
          })
          : true)
        : true;

      return matchesTitle && matchesUrl && matchesDateRange && matchesCompany;
    });

    // Apply pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;

    setPosts(filtered.slice(start, end));
    setPagination(prev => ({
      ...prev,
      total,
      totalPages
    }));
  };

  // Effect for initial data fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  const setPageSize = (size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
      totalPages: Math.ceil(prev.total / size)
    }));
  };

  const setCurrentPage = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Effect for applying filters
  useEffect(() => {
    if (allPosts.length > 0) {
      applyFiltersAndPagination(allPosts);
    }
  }, [filters, pagination.currentPage, pagination.pageSize]);

  return (
    <div>
      <SearchFilter onFilterChange={handleFilterChange} />
      <div className="text-sm text-muted-foreground mb-4">
        {pagination.total} resultado(s) encontrado(s) - Exibindo página {pagination.currentPage} de {pagination.totalPages}
      </div>

      <div className="rounded-md border relative">
        {isLoading ? <TableSkeleton /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[180px]">Início</TableHead>
                <TableHead className="w-[180px]">Fim</TableHead>
                <TableHead className="w-[100px] text-right">Duração</TableHead>
                <TableHead className="w-[200px]">Empresa</TableHead>
                <TableHead className="w-[20px]">Link</TableHead>
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
                    <div className="flex flex-col">
                      <span>{post.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {post.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(post.startTime.toString())}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(post.finishedTime.toString())}
                  </TableCell>
                  <TableCell className="text-right">
                    {`${calculateDurationInMinutes(post.startTime, post.finishedTime)} min`}
                  </TableCell>
                  <TableCell>
                    {['job_listing', 'job-listing'].includes(post.type || '') ? post.companyName : '-'}
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
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <PageSizeSelector
          pageSize={pagination.pageSize}
          onPageSizeChange={setPageSize}
          options={[10, 25, 50, 100]}
        />

        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst
                onClick={() => setCurrentPage(1)}
                disabled={pagination.currentPage === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              />
            </PaginationItem>

            {getVisiblePages(pagination.currentPage, pagination.totalPages).map((pageNum, index, array) => {
              // Add ellipsis if there's a gap
              if (index > 0 && pageNum - array[index - 1] > 1) {
                return (
                  <PaginationItem key={`ellipsis-${pageNum}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={pagination.currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}