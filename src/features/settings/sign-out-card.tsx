import { Button, Card, CardHeader, Icon } from "@/components/ui";

/** Thẻ đăng xuất trong vùng cẩn trọng — nút mở hộp xác nhận ở trang cha. */
export function SignOutCard({ onRequestSignOut }: { onRequestSignOut: () => void }) {
  return (
    <Card className="space-y-3">
      <CardHeader title="Đăng xuất" description="Bạn sẽ cần đăng nhập lại để tiếp tục học trên thiết bị này." />
      <Button variant="outline" onClick={onRequestSignOut} className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto">
        <Icon name="log-out" className="h-4 w-4" />
        Đăng xuất khỏi hệ thống
      </Button>
    </Card>
  );
}
