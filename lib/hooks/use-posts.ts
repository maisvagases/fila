import { useState, useEffect } from 'react';
import type { JobPostDTO } from '@/lib/api/types';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import type { SearchFilters } from '@/components/search-filter';

interface UsePosts {
  posts: JobPostDTO[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    total: number;
  };
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
}

export function usePosts(initialPosts: JobPostDTO[], initialTotal: number): UsePosts {
  const [allPosts, setAllPosts] = useState<JobPostDTO[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<JobPostDTO[]>(initialPosts);
  const [displayedPosts, setDisplayedPosts] = useState<JobPostDTO[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    title: '',
    url: '',
    dateRange: undefined,
    company: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: Math.ceil(initialTotal / 10),
    total: initialTotal
  });

  // Fetch posts only once on mount
  useEffect(() => {
    const fetchPosts = async () => {
      if (allPosts.length > 0) return; // Skip if we already have posts
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts?page=1&pageSize=1000');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setAllPosts(data.posts);
        setFilteredPosts(data.posts);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(data.posts.length / prev.pageSize),
          total: data.posts.length
        }));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = allPosts.filter(post => {
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
            })
          : true)
        : true;

      return matchesTitle && matchesUrl && matchesDateRange && matchesCompany;
    });

    setFilteredPosts(filtered);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.ceil(filtered.length / prev.pageSize),
      total: filtered.length
    }));
  }, [filters, allPosts]);

  // Apply pagination
  useEffect(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    setDisplayedPosts(filteredPosts.slice(start, end));
  }, [pagination.currentPage, pagination.pageSize, filteredPosts]);

  return {
    posts: displayedPosts,
    isLoading,
    error,
    pagination,
    filters,
    setFilters,
    setPageSize: (size: number) => setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
      totalPages: Math.ceil(filteredPosts.length / size)
    })),
    setCurrentPage: (page: number) => setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
  };
}