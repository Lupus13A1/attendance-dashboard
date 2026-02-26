"use client";

import { useState, useMemo } from "react";
import { Download, FileSpreadsheet, FileText, File, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";


import { AttendanceRecord } from "@/types/attendance";
import { buildAttendanceMatrix, exportCSV, exportExcel, exportPDF } from "@/lib/exportHelpers";

type ExportScope = "all" | "individual";
type ExportFormat = "csv" | "pdf" | "excel";

interface ExportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: AttendanceRecord[];
}

const formatOptions = [
  { value: "csv", label: "CSV", icon: <FileText className="h-4 w-4" /> },
  { value: "pdf", label: "PDF", icon: <File className="h-4 w-4" /> },
  { value: "excel", label: "Excel", icon: <FileSpreadsheet className="h-4 w-4" /> },
];

export const ExportStudentsDialog = ({
  open,
  onOpenChange,
  records,
}: ExportStudentsDialogProps) => {
  const [scope, setScope] = useState<ExportScope>("all");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { studentId: string; name: string }>();

    records.forEach((r) => {
      if (!map.has(r.studentId)) {
        map.set(r.studentId, {
          studentId: r.studentId,
          name: r.name,
        });
      }
    });

    return Array.from(map.values());
  }, [records]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return uniqueStudents;

    return uniqueStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueStudents, searchQuery]);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.studentId)));
    }
  };

  const canExport = scope === "all" || selectedIds.size > 0;

  const handleExport = async () => {
    const selectedStudentIds =
      scope === "all" ? undefined : Array.from(selectedIds);

    const { header, rows } = buildAttendanceMatrix(
      records,
      selectedStudentIds
    );

    if (format === "csv") {
      exportCSV(header, rows);
    } else if (format === "excel") {
      exportExcel(header, rows);
    } else if (format === "pdf") {
      await exportPDF(header, rows);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Students
          </DialogTitle>
          <DialogDescription>
            Choose which students and format to export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Scope</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as ExportScope)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="cursor-pointer text-sm">
                  All Students ({uniqueStudents.length})
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="individual" id="scope-individual" />
                <Label htmlFor="scope-individual" className="cursor-pointer text-sm">
                  Select Students
                </Label>
              </div>
            </RadioGroup>
          </div>

          {scope === "individual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Students</Label>
                {selectedIds.size > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedIds.size} selected
                  </Badge>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="rounded-md border">
                <div
                  className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 cursor-pointer"
                  onClick={toggleAll}
                >
                  <Checkbox
                    checked={
                      filteredStudents.length > 0 &&
                      selectedIds.size === filteredStudents.length
                    }
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    Select All
                  </span>
                </div>

                <div className="h-[180px]">
                  <ScrollArea className="h-full">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.studentId}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleStudent(student.studentId)}
                      >
                        <Checkbox
                          checked={selectedIds.has(student.studentId)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value as ExportFormat)}
                  className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm ${
                    format === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {opt.icon}
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!canExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};