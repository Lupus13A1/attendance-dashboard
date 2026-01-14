"use client";

import { useMemo, useState } from "react";
import { AttendanceRecord } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";
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
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, Clock, LogIn, LogOut, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const PAGE_SIZE = 10;

type SortKey =
  | "subjectCode"
  | "studentId"
  | "date"
  | "checkInTime"
  | "checkOutTime"
  | "status"
  | "createdAt"
  | "updatedAt";

type SortDirection = "asc" | "desc";

/* =======================
   STATUS → BADGE VARIANT
======================= */
const getStatusVariant = (status: AttendanceRecord["status"]): "present" | "late" | "absent" => {
  if (status === "present") return "present";
  if (status === "late") return "late";
  return "absent";
};

/* =======================
   HELPER: DISPLAY VALUE
======================= */
const displayValue = (value?: string | null) => (value && value !== "-" ? value : "-");

export function AttendanceTable({ data }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null);

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

      if (sortKey === "createdAt" || sortKey === "updatedAt" || sortKey === "date") {
        return sortDirection === "asc"
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }

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
    sortKey === column ? (sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : null;

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead onClick={() => handleSort("subjectCode")} className="cursor-pointer w-[260px]">
                <div className="flex items-center">
                  <BookOpen className="mr-1 h-3 w-3" />
                  Subject <SortIcon column="subjectCode" />
                </div>
              </TableHead>

              <TableHead>Section</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Student</TableHead>


              <TableHead onClick={() => handleSort("studentId")} className="cursor-pointer">
                <div className="flex items-center">ID <SortIcon column="studentId" /></div>
              </TableHead>

              <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                <div className="flex items-center">Date <SortIcon column="date" /></div>
              </TableHead>

              <TableHead onClick={() => handleSort("checkInTime")} className="cursor-pointer">
                <div className="flex items-center"><LogIn className="mr-1 h-3 w-3" />Check-in <SortIcon column="checkInTime" /></div>
              </TableHead>

              <TableHead onClick={() => handleSort("checkOutTime")} className="cursor-pointer">
                <div className="flex items-center"><LogOut className="mr-1 h-3 w-3" />Check-out <SortIcon column="checkOutTime" /></div>
              </TableHead>

              <TableHead>Status</TableHead>

              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                <div className="flex items-center"><Clock className="mr-1 h-3 w-3" />Created <SortIcon column="createdAt" /></div>
              </TableHead>

              <TableHead onClick={() => handleSort("updatedAt")} className="cursor-pointer">Updated</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((record) => (
              <TableRow key={`${record.studentId}-${record.createdAt}`} className="group hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{displayValue(record.subjectCode)}</span>
                    <span className="text-xs text-muted-foreground">{displayValue(record.subjectName)}</span>
                  </div>
                </TableCell>

                <TableCell>{displayValue(record.section)}</TableCell>
                <TableCell>{displayValue(record.classroom)}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    {record.image?.trim() ? (
                      <div
                        className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-md border"
                        onClick={() => setSelectedImage({ src: record.image, name: displayValue(record.fullName) })}
                      >
                        <img src={record.image} alt={`Scan image of ${record.fullName}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border text-xs text-muted-foreground">-</div>
                    )}
                    <span className="font-medium">{displayValue(record.fullName)}</span>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-sm">{displayValue(record.studentId)}</TableCell>

                {/* แสดงวันที่ dd/MM/yy */}
                <TableCell>{record.date ? format(new Date(record.date), "dd/MM/yy") : "-"}</TableCell>

                <TableCell className="font-mono">{displayValue(record.checkInTime)}</TableCell>
                <TableCell className="font-mono">{displayValue(record.checkOutTime)}</TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(record.status)}>{record.status || "-"}</Badge>
                </TableCell>

                {/* createdAt / updatedAt dd/MM/yy HH:mm */}
                <TableCell className="text-muted-foreground">
                  {record.createdAt ? format(new Date(record.createdAt), "dd/MM/yy HH:mm") : "-"}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {record.updatedAt ? format(new Date(record.updatedAt), "dd/MM/yy HH:mm") : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious asChild disabled={currentPage === 1}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={cn("flex items-center gap-1 px-2.5", currentPage === 1 && "opacity-50 cursor-not-allowed")}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
              </PaginationPrevious>
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink asChild isActive={currentPage === page}>
                    <button onClick={() => setCurrentPage(page)} className="w-9 h-9 flex items-center justify-center rounded-md">{page}</button>
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext asChild disabled={currentPage === totalPages}>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={cn("flex items-center gap-1 px-2.5", currentPage === totalPages && "opacity-50 cursor-not-allowed")}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* IMAGE PREVIEW */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="flex justify-center">
              <img src={selectedImage.src} alt={selectedImage.name} className="max-h-96 w-full rounded-lg object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
