import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export function PageSizeSelector({ pageSize, onPageSizeChange }: PageSizeSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Registros por página:</span>
            <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(Number(value))}
            >
                <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
} 