"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
  ArrowUp,
  ArrowDown,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const PAGE_SIZE = 10;

type SortKey =
  | "studentId"
  | "name"
  | "timestamp"
  | "status"
  | "type";

type SortDirection = "asc" | "desc";

/* 🔥 รองรับ out ด้วย */
const getStatusVariant = (
  status: AttendanceRecord["status"],
): "present" | "late" | "absent" => {
  if (status === "present") return "present";
  if (status === "late") return "late";
  return "absent";
};

export function AttendanceTable({ data }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] =
    useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [selectedImage, setSelectedImage] =
    useState<{ src: string; name: string } | null>(null);

  /* 🔥 RESET PAGE เมื่อ data เปลี่ยน */
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  /* ===============================
     SORT (ไม่ filter type แล้ว)
  =============================== */
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "timestamp") {
        return sortDirection === "asc"
          ? new Date(aVal).getTime() -
              new Date(bVal).getTime()
          : new Date(bVal).getTime() -
              new Date(aVal).getTime();
      }

      return sortDirection === "asc"
        ? String(aVal ?? "").localeCompare(
            String(bVal ?? ""),
          )
        : String(bVal ?? "").localeCompare(
            String(aVal ?? ""),
          );
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.ceil(
    sortedData.length / PAGE_SIZE,
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) =>
        d === "asc" ? "desc" : "asc",
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

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
              <TableHead
                onClick={() => handleSort("studentId")}
                className="cursor-pointer"
              >
                ID <SortIcon column="studentId" />
              </TableHead>

              <TableHead>Snap Image</TableHead>

              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer"
              >
                Student <SortIcon column="name" />
              </TableHead>

              <TableHead
                onClick={() => handleSort("timestamp")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  Date / Time{" "}
                  <SortIcon column="timestamp" />
                </div>
              </TableHead>

              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((record) => (
                <TableRow
                  key={record.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono">
                    {record.studentId || "-"}
                  </TableCell>

                  <TableCell>
                    {record.snapshotImg ? (
                      <img
                        src={record.snapshotImg}
                        alt="snapshot"
                        className="h-12 w-16 object-cover rounded-md border cursor-pointer hover:scale-105 transition"
                        onClick={() =>
                          setSelectedImage({
                            src: record.snapshotImg!,
                            name: record.name,
                          })
                        }
                      />
                    ) : (
                      <div className="h-12 w-16 flex items-center justify-center border rounded-md text-xs text-muted-foreground">
                        -
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {record.name || "-"}
                  </TableCell>

                  <TableCell className="font-mono">
                    {record.timestamp
                      ? format(
                          new Date(record.timestamp),
                          "dd/MM/yy HH:mm",
                        )
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getStatusVariant(
                        record.status,
                      )}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {record.type}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                asChild
                disabled={currentPage === 1}
              >
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(1, p - 1),
                    )
                  }
                  className={cn(
                    "flex items-center gap-1 px-2.5",
                    currentPage === 1 &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
              </PaginationPrevious>
            </PaginationItem>

            {Array.from({ length: totalPages }).map(
              (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      asChild
                      isActive={
                        currentPage === page
                      }
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(page)
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-md"
                      >
                        {page}
                      </button>
                    </PaginationLink>
                  </PaginationItem>
                );
              },
            )}

            <PaginationItem>
              <PaginationNext
                asChild
                disabled={
                  currentPage === totalPages
                }
              >
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1),
                    )
                  }
                  className={cn(
                    "flex items-center gap-1 px-2.5",
                    currentPage === totalPages &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  Next{" "}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog
        open={!!selectedImage}
        onOpenChange={() =>
          setSelectedImage(null)
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedImage?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="max-h-96 w-full rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}