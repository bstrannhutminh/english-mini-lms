"use client";

/**
 * Kiểm tra tay các primitive UI + token. Chỉ render trong dev (page.tsx guard).
 * Tham số: xem cả ở viewport mobile (390px) và desktop (1280px).
 */
import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  Icon,
  Modal,
  Skeleton,
  SkeletonText,
  Spinner,
  Tabs,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { PageContainer, UserMenu } from "@/components/layout";
import { ACTIVITY_MODES } from "@/lib/content-constants";
import { MODE_META, modeMeta } from "@/lib/modes";
import { IconGallery } from "./ui-preview-icons";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="border-b border-border pb-2 text-lg font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={() => toast.success("Đã lưu từ vào Sổ từ", "review vào ngày mai")}>
        Toast success
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.error("Lỗi kết nối máy chủ", "Kiểm tra mạng rồi thử lại")}>
        Toast error
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.toast({ title: "Nhắc học", variant: "warning" })}>
        Toast warning
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.toast({ title: "Đang đồng bộ…", duration: 0 })}>
        Toast sticky
      </Button>
    </div>
  );
}

export function UiPreviewClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [pill, setPill] = useState("due");

  return (
    <ToastProvider>
      <PageContainer size="wide" className="space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-text">UI Preview — design system</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Kiểm tra tay toàn bộ primitive. Route này chỉ tồn tại trong dev.
          </p>
        </div>

        <Section title="Button — variants">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary md</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small (36px)</Button>
            <Button size="md">Medium (44px)</Button>
            <Button size="lg">Large (48px)</Button>
            <Button size="icon" aria-label="Icon button demo"><Icon name="plus" /></Button>
          </div>
          <Button fullWidth>Full width</Button>
        </Section>

        <Section title="Badge — status + skill tones">
          <div className="flex flex-wrap gap-2">
            <Badge>neutral</Badge>
            <Badge tone="success">Đã duyệt</Badge>
            <Badge tone="warning">Đang xét</Badge>
            <Badge tone="error">Thất bại</Badge>
            <Badge tone="info">Nháp</Badge>
            <Badge tone="writing">Viết</Badge>
            <Badge tone="reading">Đọc–dịch</Badge>
            <Badge tone="speaking">Nói</Badge>
            <Badge tone="listening">Nghe</Badge>
            <Badge>IELTS</Badge>
          </div>
        </Section>

        <Section title="MODE_META — nguồn duy nhất cho nhãn/màu/icon mode">
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_MODES.map((mode) => {
              const meta = MODE_META[mode];
              return (
                <span
                  key={mode}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.badgeClass}`}
                >
                  <Icon name={meta.icon} className={`h-3.5 w-3.5 ${meta.iconClass}`} />
                  {meta.shortLabel}
                  {meta.isIelts ? <span className="rounded bg-white/70 px-1 font-bold">IELTS</span> : null}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-text-muted">
            modeMeta(&quot;ielts-writing&quot;).skill = {modeMeta("ielts-writing").skill} ·
            modeMeta(&quot;lạ&quot;).label = {modeMeta("bat-quai").label}
          </p>
        </Section>

        <Section title="Card">
          <Card>
            <CardHeader
              title="Thẻ chuẩn"
              description="CardHeader với title + description + action slot."
              action={<Badge tone="success">ok</Badge>}
            />
            <p className="mt-3 text-sm text-text-secondary">
              Nội dung card. <code>padded=false</code> để tự chia vùng.
            </p>
          </Card>
          <Card interactive className="mt-3">
            <p className="text-sm font-medium">Card interactive — hover đổi bóng/viền.</p>
          </Card>
        </Section>

        <Section title="Modal & ConfirmDialog">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setModalOpen(true)}>Mở Modal</Button>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>Mở Confirm</Button>
            <Button variant="danger" onClick={() => setDangerOpen(true)}>Confirm danger</Button>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Tiêu đề modal"
            description="ESC hoặc bấm nền để đóng. Khoá scroll nền, focus vào panel."
            footer={<Button onClick={() => setModalOpen(false)}>Đã hiểu</Button>}
          >
            <p className="text-sm text-text-secondary">Nội dung tuỳ ý trong modal — form, câu hỏi, v.v.</p>
          </Modal>
          <ConfirmDialog
            open={confirmOpen}
            title="Lưu thay đổi?"
            description="Bản nháp hiện tại sẽ được ghi đè."
            onConfirm={() => setConfirmOpen(false)}
            onCancel={() => setConfirmOpen(false)}
          />
          <ConfirmDialog
            open={dangerOpen}
            title="Xoá từ này?"
            description="Từ sẽ bị xoá khỏi Sổ từ và lịch ôn. Không hoàn tác được."
            confirmLabel="Xoá"
            tone="danger"
            onConfirm={() => setDangerOpen(false)}
            onCancel={() => setDangerOpen(false)}
          />
        </Section>

        <Section title="Toast">
          <ToastDemo />
        </Section>

        <Section title="Tabs">
          <Tabs
            aria-label="Demo tab underline"
            value={tab}
            onValueChange={setTab}
            tabs={[
              { value: "all", label: "Tất cả" },
              { value: "draft", label: "Nháp", count: 3 },
              { value: "done", label: "Đã chấm", count: 12 },
            ]}
          />
          <Tabs
            aria-label="Demo tab pills"
            variant="pills"
            value={pill}
            onValueChange={setPill}
            tabs={[
              { value: "due", label: "Đến hạn", count: 5 },
              { value: "all", label: "Tất cả" },
              { value: "mastered", label: "Đã thuộc", icon: "check-circle" },
            ]}
          />
        </Section>

        <Section title="Spinner & Skeleton">
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" label="Đang chấm bài" />
          </div>
          <SkeletonText lines={3} />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </Section>

        <Section title="EmptyState">
          <EmptyState
            icon="book-open"
            title="Chưa có bài nào"
            description="Vào Thư viện chọn một bài để bắt đầu phiên học đầu tiên."
            action={<Button size="sm">Mở Thư viện</Button>}
          />
        </Section>

        <Section title="UserMenu (menu Tôi)">
          <div className="flex items-center gap-6">
            <UserMenu user={{ displayName: "BS. Minh", isAdmin: true }} variant="avatar" />
            <span className="text-xs text-text-muted">← avatar (admin → có mục Quản trị)</span>
          </div>
          <div className="max-w-60">
            <UserMenu user={{ displayName: "BS. Minh", isAdmin: false }} variant="sidebar" />
          </div>
        </Section>

        <Section title="Icons">
          <IconGallery />
        </Section>
      </PageContainer>
    </ToastProvider>
  );
}
