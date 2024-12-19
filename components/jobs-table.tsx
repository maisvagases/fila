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
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { SearchFilter, SearchFilters } from './search-filter';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { getPaginatedJobPosts } from "@/lib/api/job-posts";
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';


interface JobsTableProps {
  initialPosts: JobPostDTO[];
  totalPosts: number;
}

export function JobsTable({ initialPosts, totalPosts }: JobsTableProps) {
  const [posts, setPosts] = useState<JobPostDTO[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    title: '',
    url: '',
    dateRange: undefined,
    company: ''
  });

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts?page=1&pageSize=1000');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        console.log(`Received ${data.posts.length} posts from API`);
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    
    fetchAllPosts();
  }, []);

  useEffect(() => {
    const fetchPaginatedPosts = async () => {
      try {
        setIsLoading(true);
        const { posts, totalPages } = await getPaginatedJobPosts(currentPage, pageSize);
        setPosts(posts);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching paginated posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaginatedPosts();
  }, [currentPage, pageSize]);

  const filteredPosts = posts.filter(post => {
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset para a primeira página ao mudar o tamanho
  };

  return (
    <div>
      <SearchFilter onFilterChange={setFilters} />
      <div className="text-sm text-muted-foreground mb-4">
        {filteredPosts.length} resultado(s) encontrado(s)
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
              <TableHead key="image" className="w-[80px]">
                Image
              </TableHead>
              <TableHead key="title">Título</TableHead>
              <TableHead key="startTime" className="w-[180px]">
                Início
              </TableHead>
              <TableHead key="endTime" className="w-[180px]">
                Fim
              </TableHead>
              <TableHead key="duration" className="w-[100px] text-right">
                Duração
              </TableHead>
              <TableHead key="company" className="w-[200px]">Empresa</TableHead>
              <TableHead key="link" className="w-[20px]"> Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => {
              return (
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
                    {post.startTime
                      ? formatDateTime(post.startTime)
                      : "Data inválida"}
                  </TableCell>
                  <TableCell>
                    {post.finishedTime
                      ? formatDateTime(post.finishedTime)
                      : "Data inválida"}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <PageSizeSelector 
          pageSize={pageSize} 
          onPageSizeChange={handlePageSizeChange} 
        />
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i + 1);
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

    </div>
  );
}
