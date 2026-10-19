/**
 * Bộ primitive UI dùng chung — import gọn: `import { Button, Card } from "@/components/ui"`.
 * Kiểm tra tay mọi primitive/state tại /ui-preview (chỉ môi trường dev).
 */
export { Badge, type BadgeProps, type BadgeTone } from "./badge";
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./button";
export { Card, CardHeader, type CardHeaderProps, type CardProps } from "./card";
export { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
export { EmptyState, type EmptyStateProps } from "./empty-state";
export { Icon, type IconName, type IconProps } from "./icons";
export { Modal, type ModalProps } from "./modal";
export { Skeleton, SkeletonText, type SkeletonProps } from "./skeleton";
export { Spinner, type SpinnerProps } from "./spinner";
export { Tabs, type TabItem, type TabsProps } from "./tabs";
export {
  ToastProvider,
  useToast,
  type ToastOptions,
  type ToastVariant,
} from "./toast";
