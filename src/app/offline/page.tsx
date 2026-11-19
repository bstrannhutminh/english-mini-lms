import { Icon } from "@/components/ui";

export const metadata = { title: "Đang ngoại tuyến — English Mini LMS" };

/** Cached HTML must remain readable before any external CSS or JS has been cached. */
const offlineStyles = `
.offline-fallback{position:fixed;inset:0;overflow:auto;box-sizing:border-box;display:grid;place-items:center;padding:24px 16px;background:#f8fafc;color:#0f172a;font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.offline-fallback *{box-sizing:border-box}
.offline-fallback-card{width:100%;max-width:448px;border:1px solid #e2e8f0;border-radius:20px;background:#fff;padding:32px;text-align:center;box-shadow:0 6px 24px #0f172a08}
.offline-fallback-symbol{display:grid;place-items:center;width:56px;height:56px;margin:0 auto 16px;border-radius:16px;background:#f0fdfa;color:#0f766e}
.offline-fallback-symbol svg{width:28px;height:28px}
.offline-fallback h1{margin:0;font-size:22px;line-height:1.35;letter-spacing:-.02em}
.offline-fallback p{margin:12px 0 24px;color:#475569}
.offline-fallback a{display:inline-flex;min-height:48px;align-items:center;justify-content:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f766e;color:#fff;font-weight:600;text-decoration:none}
.offline-fallback a:hover{background:#115e59}
.offline-fallback a:focus-visible{outline:3px solid #14b8a6;outline-offset:4px}
.offline-fallback a svg{width:18px;height:18px}
`;

export default function OfflinePage() {
  return (
    <main className="offline-fallback">
      <style>{offlineStyles}</style>
      <div className="offline-fallback-card">
        <div className="offline-fallback-symbol"><Icon name="alert-triangle" /></div>
        <h1>Chưa có kết nối mạng</h1>
        <p>
          English Mini LMS cần mạng để tải bài học, lưu nháp và chấm bài cùng AI.
          Khi có Wi-Fi hoặc 4G trở lại, bấm nút bên dưới để tiếp tục.
        </p>
        <a href="/today"><Icon name="refresh" />Thử kết nối lại</a>
      </div>
    </main>
  );
}
