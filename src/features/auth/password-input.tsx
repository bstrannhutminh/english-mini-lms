"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icons";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

/** Ô mật khẩu + nút hiện/ẩn (icon eye/eye-off từ bộ icon nội bộ). */
export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Nhập mật khẩu...",
  autoComplete = "current-password",
  required = true,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-control pr-14"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-subtle hover:text-text"
      >
        <Icon name={show ? "eye-off" : "eye"} className="h-5 w-5" />
      </button>
    </div>
  );
}
