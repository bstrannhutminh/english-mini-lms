"use client";

/**
 * Tab "Drive Sync" — LUÔN chạy dry-run trước; nút "Áp dụng" chỉ mở sau khi
 * dry-run xong và phải qua ConfirmDialog (không alert/confirm trình duyệt).
 */
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  Icon,
  useToast,
} from "@/components/ui";
import type { SyncDriveResult } from "@/contracts/admin-dashboard";
import { syncDrive } from "./admin-api";
import { ResultCard } from "./drive-sync-result";

export default function DriveSyncTab() {
  const toast = useToast();
  const [loading, setLoading] = useState<"dry" | "apply" | null>(null);
  const [dryResult, setDryResult] = useState<SyncDriveResult | null>(null);
  const [applyResult, setApplyResult] = useState<SyncDriveResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const canApply =
    dryResult !== null &&
    (dryResult.added.length > 0 || dryResult.updated.length > 0);

  async function runDryCheck() {
    setLoading("dry");
    setApiError(null);
    setApplyResult(null);
    try {
      const r = await syncDrive(true);
      setDryResult(r);
      if (r.errors.some((e) => !e.message.startsWith("[warning]"))) {
        toast.error("Dry-run có lỗi", "Xem chi tiết bên dưới trước khi áp dụng.");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Lỗi kết nối.");
      setDryResult(null);
    } finally {
      setLoading(null);
    }
  }

  async function runApply() {
    setConfirmOpen(false);
    setLoading("apply");
    setApiError(null);
    try {
      const r = await syncDrive(false);
      setApplyResult(r);
      toast.success("Đã đồng bộ", `${r.added.length} thêm mới · ${r.updated.length} cập nhật.`);
      // Sau apply, kết quả dry-run cũ không còn hợp lệ — yêu cầu kiểm tra lại.
      setDryResult(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Lỗi kết nối.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Đồng bộ từ Google Drive"
          description={
            <>
              Đọc <code className="bg-slate-100 px-1 rounded text-xs">manifest.yaml</code>{" "}
              và nạp nội dung <strong>đã duyệt</strong> vào DB. Bài do admin tạo
              không bao giờ bị ghi đè.
            </>
          }
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            loading={loading === "dry"}
            onClick={runDryCheck}
            disabled={loading !== null}
          >
            <Icon name="search" className="h-4 w-4" /> Kiểm tra (dry-run)
          </Button>
          <Button
            variant="secondary"
            disabled={!canApply || loading !== null}
            title={
              canApply
                ? "Ghi thay đổi vào DB"
                : "Chạy dry-run trước để xem thay đổi"
            }
            onClick={() => setConfirmOpen(true)}
          >
            <Icon name="check" className="h-4 w-4" /> Áp dụng vào DB
          </Button>
          {dryResult && (
            <span className="text-xs text-slate-500">
              Dry-run lúc {new Date().toLocaleTimeString("vi-VN")} —{" "}
              {canApply
                ? "có thay đổi để áp dụng"
                : "không có gì để ghi"}
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Luồng an toàn: <strong>1.</strong> Kiểm tra (không ghi) →{" "}
          <strong>2.</strong> Xem thay đổi → <strong>3.</strong> Xác nhận áp dụng.
        </p>
      </Card>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <p className="font-semibold">Lỗi kết nối API</p>
          <p className="mt-1">{apiError}</p>
        </div>
      )}

      {dryResult && <ResultCard result={dryResult} title="Kết quả dry-run (chưa ghi DB)" />}
      {applyResult && <ResultCard result={applyResult} title="Đồng bộ hoàn tất" />}

      <ConfirmDialog
        open={confirmOpen}
        title="Áp dụng đồng bộ vào DB?"
        description={`Sẽ ghi ${dryResult?.added.length ?? 0} mục mới và ${dryResult?.updated.length ?? 0} mục cập nhật từ Drive. Bài do admin tạo (đã duyệt/Nháp) không bị ảnh hưởng.`}
        confirmLabel="Áp dụng"
        loading={loading === "apply"}
        onConfirm={runApply}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
