import type { ReactNode } from "react";

export function SettingsSection({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-border pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
      <header className="space-y-2">
        <h2 className="section-title">{title}</h2>
        <p className="text-base leading-relaxed text-text-secondary">{description}</p>
      </header>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}
