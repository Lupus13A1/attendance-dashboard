"use client";

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
import {
  Clock,
  LogIn,
  LogOut,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";

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

const getStatusVariant = (
  status: string
): "present" | "late" | "absent" => {
  switch (status) {
    case "Present":
      return "present";
    case "Late":
      return "late";
    case "Absent":
      return "absent";
    default:
      return "present";
  }
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export function AttendanceTable({ data }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const [sortKey, setSortKey] =
    useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) =>
        d === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      if (sortKey === "createdAt") {
        return sortDirection === "asc"
          ? new Date(aVal).getTime() -
              new Date(bVal).getTime()
          : new Date(bVal).getTime() -
              new Date(aVal).getTime();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
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
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )
    ) : null;

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Image</TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("studentId")}
              >
                Student ID <SortIcon column="studentId" />
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date <SortIcon column="date" />
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("checkInTime")}
              >
                <LogIn className="inline h-4 w-4 mr-1" />
                Check-in <SortIcon column="checkInTime" />
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("checkOutTime")}
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Check-out <SortIcon column="checkOutTime" />
              </TableHead>

              <TableHead>Status</TableHead>

              {/* 🔥 CREATED AT */}
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At <SortIcon column="createdAt" />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((record, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="h-12 w-12 cursor-pointer"
                      onClick={() => {
                        setSelectedImage({
                          src: record.image,
                          name: record.fullName,
                        });
                        setOpen(true);
                      }}
                    >
                      <AvatarImage src={record.image} />
                      <AvatarFallback>
                        {getInitials(record.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{record.fullName}</span>
                  </div>
                </TableCell>

                <TableCell>{record.studentId}</TableCell>

                <TableCell>
                  {format(new Date(record.date), "dd/MM/yyyy")}
                </TableCell>

                <TableCell>
                  {record.checkInTime ?? "—"}
                </TableCell>

                <TableCell>
                  {record.checkOutTime ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>

                {/* 🔥 CREATED AT VALUE */}
                <TableCell className="text-sm text-muted-foreground">
                  {format(
                    new Date(record.createdAt),
                    "dd/MM/yyyy HH:mm:ss"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((p) => Math.max(p - 1, 1))
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(p + 1, totalPages)
                      )
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0">
          {selectedImage && (
            <>
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="w-full rounded-lg"
              />
              <div className="p-4 text-center font-medium">
                {selectedImage.name}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
