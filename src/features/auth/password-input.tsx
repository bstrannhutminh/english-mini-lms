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
        className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-600 transition"
      >
        <Icon name={show ? "eye-off" : "eye"} className="h-5 w-5" />
      </button>
    </div>
  );
}
