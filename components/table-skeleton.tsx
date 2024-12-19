import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableSkeleton() {
  return (
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
        {Array.from({ length: 10 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-4 w-[50px] ml-auto" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[150px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-4" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}