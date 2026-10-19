"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./icons";

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms trước khi tự ẩn; 0 = đứng yên cho tới khi đóng tay. Mặc định 5000. */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "description">> {
  id: number;
  description?: string;
}

interface ToastApi {
  toast: (options: ToastOptions) => void;
  /** Gợi nhanh theo variant. */
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: IconName; iconClass: string; role: "status" | "alert" }
> = {
  default: { icon: "info", iconClass: "text-slate-400", role: "status" },
  success: { icon: "check-circle", iconClass: "text-emerald-600", role: "status" },
  warning: { icon: "alert-triangle", iconClass: "text-amber-600", role: "status" },
  error: { icon: "alert-triangle", iconClass: "text-red-600", role: "alert" },
};

const DEFAULT_DURATION_MS = 5000;

/**
 * Provider + viewport toast. Gắn MỘT lần ở (main)/layout bọc quanh children:
 *   <ToastProvider>{children}</ToastProvider>
 * Rồi trong client component: `const toast = useToast(); toast.error("…")`.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      const duration = options.duration ?? DEFAULT_DURATION_MS;
      const item: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "default",
        duration,
      };
      setItems((prev) => [...prev.slice(-3), item]); // tối đa 4 toast
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
    },
    [dismiss]
  );

  // Dọn mọi timer khi provider unmount (đổi layout/hmr)
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, variant: "success" }),
      error: (title, description) =>
        toast({ title, description, variant: "error", duration: 7000 }),
      dismiss,
    }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Viewport: nổi trên thanh tab dưới (mobile), góc phải dưới (desktop) */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 z-(--z-toast) flex flex-col gap-2 bottom-[calc(var(--nav-height)+0.75rem)] sm:inset-x-auto sm:right-4 sm:w-96 lg:bottom-4"
      >
        {items.map((item) => {
          const meta = VARIANT_META[item.variant];
          return (
            <div
              key={item.id}
              role={meta.role}
              className="pointer-events-auto flex animate-slide-up items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-pop"
            >
              <Icon name={meta.icon} className={cn("mt-0.5 h-5 w-5", meta.iconClass)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-text">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-0.5 text-sm leading-snug text-text-secondary">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Đóng thông báo"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Hook toast — phải nằm dưới <ToastProvider>. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast phải dùng bên trong <ToastProvider> (đã gắn ở layout (main)).");
  }
  return ctx;
}
