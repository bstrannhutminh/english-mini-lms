"use client";

import { useState } from "react";
import { Button, Card, CardHeader, useToast } from "@/components/ui";

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
        description="Tải về toàn bộ lịch sử học tập, bài nộp, nhận xét AI, sổ từ vựng và link tải file ghi âm (JSON)."
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
            <span aria-hidden>📦</span> Xuất dữ liệu học tập (JSON)
          </>
        )}
      </Button>
    </Card>
  );
}
