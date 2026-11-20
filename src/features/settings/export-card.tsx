"use client";

import { useState } from "react";
import { Button, Card, CardHeader, Icon, useToast } from "@/components/ui";

/**
 * Xuất dữ liệu: GET /api/v1/settings/export trả file JSON (blob) —
 * không qua apiFetch vì response không phải JSON envelope.
 */
export function ExportCard() {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    try {
      setExporting(true);
      const res = await fetch("/api/v1/settings/export");
      if (!res.ok) throw new Error("Lỗi tải bản xuất");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `english-mini-lms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error(
        "Xuất dữ liệu thất bại",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="space-y-3">
      <CardHeader
        title="Xuất dữ liệu của tôi"
        description="Tải hồ sơ, các phiên học, bài nộp chưa xóa, nhận xét và sổ từ dưới dạng JSON. Link âm thanh chỉ có khi tạo được; bản xuất chưa gồm nháp và lịch sử từng lượt ôn từ."
      />
      <Button
        variant="secondary"
        onClick={handleExport}
        loading={exporting}
        className="w-full sm:w-auto"
      >
        {exporting ? (
          "Đang tạo file sao lưu..."
        ) : (
          <>
            <Icon name="save" className="h-4 w-4" /> Xuất dữ liệu học tập (JSON)
          </>
        )}
      </Button>
    </Card>
  );
}
