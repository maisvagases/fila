'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface SearchFilterProps {
    onFilterChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
    title: string;
    url: string;
    startDate: string;
    endDate: string;
}

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
    const [filters, setFilters] = useState<SearchFilters>({
        title: '',
        url: '',
        startDate: '',
        endDate: ''
    });

    const handleFilterChange = (field: keyof SearchFilters) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newFilters = {
            ...filters,
            [field]: e.target.value
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-sm text-muted-foreground">
                        Título
                    </label>
                    <Input
                        id="title"
                        placeholder="Filtrar por título..."
                        value={filters.title}
                        onChange={handleFilterChange('title')}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="url" className="text-sm text-muted-foreground">
                        Link
                    </label>
                    <Input
                        id="url"
                        placeholder="Filtrar por link..."
                        value={filters.url}
                        onChange={handleFilterChange('url')}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="startDate" className="text-sm text-muted-foreground">
                        Data de Início
                    </label>
                    <Input
                        id="startDate"
                        placeholder="dd/mm/yyyy"
                        value={filters.startDate}
                        onChange={handleFilterChange('startDate')}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="endDate" className="text-sm text-muted-foreground">
                        Data de Fim
                    </label>
                    <Input
                        id="endDate"
                        placeholder="dd/mm/yyyy"
                        value={filters.endDate}
                        onChange={handleFilterChange('endDate')}
                    />
                </div>
            </div>
        </div>
    );
} 