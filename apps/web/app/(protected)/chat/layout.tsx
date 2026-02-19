import type { Metadata } from "next";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "New Conversation",
};

export default function Layout({ children }: LayoutProps) {
  return <Suspense>{children}</Suspense>;
}
