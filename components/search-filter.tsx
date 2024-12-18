'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface SearchFilterProps {
    onFilterChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
    query: string;
}

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
    const [query, setQuery] = useState('');

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        onFilterChange({ query: newQuery });
    };

    return (
        <div className="mb-6">
            <Input
                type="text"
                placeholder="Pesquisar por título, data ou link..."
                value={query}
                onChange={handleQueryChange}
                className="max-w-md"
            />
        </div>
    );
} 