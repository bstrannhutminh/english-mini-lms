import { notFound } from "next/navigation";
import { UiPreviewClient } from "./ui-preview-client";

export const metadata = { title: "UI Preview (dev)" };

/**
 * Trang kiểm tra tay các primitive src/components/ui + layout.
 * CHỈ dev — production trả 404 để không lộ surface nội bộ.
 */
export default function UiPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <UiPreviewClient />;
}
