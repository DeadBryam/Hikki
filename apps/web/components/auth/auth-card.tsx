"use client";

import { cn } from "@/lib/utils";

export interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
  title: string;
}

export function AuthCard({
  children,
  title,
  subtitle,
  className,
}: AuthCardProps) {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>

      <div
        className={cn(
          "auth-card relative overflow-hidden rounded-lg border border-border bg-card p-8",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
