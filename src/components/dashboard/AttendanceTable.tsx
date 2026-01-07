import { useMemo, useState } from "react";
import { AttendanceRecord } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, Clock, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const PAGE_SIZE = 10;

type SortKey =
  | "studentId"
  | "date"
  | "checkInTime"
  | "checkOutTime"
  | "status"
  | "createdAt";

type SortDirection = "asc" | "desc";

/* =======================
   STATUS → BADGE VARIANT
======================= */
const getStatusVariant = (
  status: AttendanceRecord["status"]
): "present" | "late" | "absent" => status;

/* =======================
   HELPERS
======================= */
const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export function AttendanceTable({ data }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  /* =======================
     SORT DATA
  ======================= */
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      // Date & timestamp
      if (sortKey === "createdAt" || sortKey === "date") {
        return sortDirection === "asc"
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }

      // Time fields (HH:mm)
      if (sortKey === "checkInTime" || sortKey === "checkOutTime") {
        return sortDirection === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }

      // Default string sort
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const SortIcon = ({ column }: { column: SortKey }) =>
    sortKey === column ? (
      sortDirection === "asc" ? (
        <ArrowUp className="ml-1 h-3 w-3" />
      ) : (
        <ArrowDown className="ml-1 h-3 w-3" />
      )
    ) : null;

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[200px]">Student</TableHead>

              <TableHead onClick={() => handleSort("studentId")} className="cursor-pointer">
                <div className="flex items-center">
                  ID <SortIcon column="studentId" />
                </div>
              </TableHead>

              <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                <div className="flex items-center">
                  Date <SortIcon column="date" />
                </div>
              </TableHead>

              <TableHead onClick={() => handleSort("checkInTime")} className="cursor-pointer">
                <div className="flex items-center">
                  <LogIn className="mr-1 h-3 w-3" />
                  Check-in <SortIcon column="checkInTime" />
                </div>
              </TableHead>

              <TableHead onClick={() => handleSort("checkOutTime")} className="cursor-pointer">
                <div className="flex items-center">
                  <LogOut className="mr-1 h-3 w-3" />
                  Check-out <SortIcon column="checkOutTime" />
                </div>
              </TableHead>

              <TableHead>Status</TableHead>

              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  Recorded <SortIcon column="createdAt" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((record) => (
              <TableRow
                key={`${record.studentId}-${record.createdAt}`}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="h-9 w-9 cursor-pointer"
                      onClick={() =>
                        setSelectedImage({
                          src: record.image,
                          name: record.fullName,
                        })
                      }
                    >
                      <AvatarImage src={record.image} />
                      <AvatarFallback>
                        {getInitials(record.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{record.fullName}</span>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-sm">
                  {record.studentId}
                </TableCell>

                <TableCell>
                  {format(new Date(record.date), "MMM d, yyyy")}
                </TableCell>

                <TableCell className="font-mono">
                  {record.checkInTime ?? "—"}
                </TableCell>

                <TableCell className="font-mono">
                  {record.checkOutTime ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {format(new Date(record.createdAt), "MMM d, HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="rounded-lg max-h-96 object-cover"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
