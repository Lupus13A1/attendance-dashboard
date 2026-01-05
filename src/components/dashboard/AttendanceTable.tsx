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
import { Clock, LogIn, LogOut } from "lucide-react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const PAGE_SIZE = 10;

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

  // popup state
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return data.slice(start, end);
  }, [data, currentPage]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No records found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters to find attendance records.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Image</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <div className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Check-in
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" />
                  Check-out
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((record, index) => (
              <TableRow
                key={`${record.studentId}-${record.date}-${index}`}
                className="hover:bg-muted/30"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="h-14 w-14 cursor-pointer hover:scale-105 transition"
                      onClick={() => {
                        setSelectedImage({
                          src: record.image,
                          name: record.fullName,
                        });
                        setOpen(true);
                      }}
                    >
                      <AvatarImage
                        src={record.image}
                        alt={record.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getInitials(record.fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-medium">
                      {record.fullName}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-sm text-muted-foreground">
                  {record.studentId}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {format(new Date(record.date), "MMM dd, yyyy")}
                </TableCell>

                <TableCell>
                  {record.checkInTime ? (
                    <span className="font-mono text-sm">
                      {record.checkInTime}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  {record.checkOutTime ? (
                    <span className="font-mono text-sm">
                      {record.checkOutTime}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((p) => Math.max(p - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(p + 1, totalPages)
                      )
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ================= IMAGE POPUP ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0">
          {selectedImage && (
            <>
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="w-full h-auto rounded-lg"
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
