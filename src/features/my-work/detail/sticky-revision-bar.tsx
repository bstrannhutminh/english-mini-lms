"use client";

import Link from "next/link";
import { Button, Icon, type IconName } from "@/components/ui";
import type { LatestRevisionRef } from "../types";

interface StickyRevisionBarProps {
  label: string;
  icon: IconName;
  onStartRevision: () => void;
  isCreating: boolean;
  /** Đã có bản sửa → thanh này dẫn tới bản đó thay vì tạo phiên sửa mới. */
  latestRevision?: LatestRevisionRef | null;
}

/**
 * Thanh hành động chính dính đáy trên mobile (<lg), nằm ngay TRÊN thanh tab
 * (`bottom-(--nav-height)`). Cùng handler/trạng thái với CTA trong thẻ tóm tắt;
 * trang phải cộng padding đáy để nội dung không bị che.
 */
export function StickyRevisionBar({ label, icon, onStartRevision, isCreating, latestRevision = null }: StickyRevisionBarProps) {
  return (
    <div
      role="region"
      aria-label="Hành động chính"
      className="fixed inset-x-0 bottom-(--nav-height) z-(--z-nav) border-t border-border bg-surface/95 px-5 py-3 shadow-[0_-8px_24px_-16px_rgb(23_44_43/0.25)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto max-w-xl">
        {latestRevision ? (
          <Link href={`/my-work/${latestRevision.id}`}
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-white no-underline shadow-card hover:bg-primary-dark">
            <Icon name="layers" className="h-4 w-4" />
            Mở Bản {latestRevision.revision} và góp ý
          </Link>
        ) : (
          <Button size="lg" fullWidth onClick={onStartRevision} loading={isCreating}>
            {isCreating ? null : <Icon name={icon} className="h-4 w-4" />}
            {isCreating ? "Đang mở phiên…" : label}
          </Button>
        )}
      </div>
    </div>
  );
}
