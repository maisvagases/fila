import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (newSize: number) => void;
    options?: number[];
}

export function PageSizeSelector({
    pageSize,
    onPageSizeChange,
    options = [10, 25, 50, 100]
}: PageSizeSelectorProps) {
    return (
        <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
                Itens por página
            </p>
            <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(Number(value))}
            >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {options.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}