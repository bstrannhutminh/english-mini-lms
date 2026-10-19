import { LoginForm } from "@/features/auth/login-form";
import {
  isMagicLinkError,
  loginErrorMessage,
} from "@/features/auth/login-messages";

export const metadata = {
  title: "Đăng nhập — English Mini LMS",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

/**
 * /login — page mỏng: đọc ?error / ?reason / ?error_code / ?message
 * (do /auth/callback gắn khi PKCE exchange thất bại), map sang tiếng Việt
 * rồi render form client.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const input = {
    error: pick(params.error),
    reason: pick(params.reason) ?? pick(params.error_code),
    message: pick(params.message),
  };

  return (
    <LoginForm
      initialError={loginErrorMessage(input)}
      showBrowserHint={isMagicLinkError(input)}
    />
  );
}
