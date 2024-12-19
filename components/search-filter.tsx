"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface SearchFilterProps {
  onFilterChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  title: string;
  url: string;
  dateRange: DateRange | undefined;
  company: string;
}

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    title: "",
    url: "",
    dateRange: undefined,
    company: "",
  });

  const handleTextFilterChange = (field: keyof SearchFilters) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      const newFilters = {
        ...filters,
        [field]: value,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    };
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    const newFilters = {
      ...filters,
      dateRange,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearDateRange = () => {
    const newFilters = {
      ...filters,
      dateRange: undefined,
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
            onChange={handleTextFilterChange("title")}
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
            onChange={handleTextFilterChange("url")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-sm text-muted-foreground">
            Empresa
          </label>
          <Input
            id="company"
            placeholder="Filtrar por empresa..."
            value={filters.company}
            onChange={handleTextFilterChange("company")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">
            Intervalo de Datas
          </label>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(filters.dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Selecione um intervalo</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {filters.dateRange && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearDateRange}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
