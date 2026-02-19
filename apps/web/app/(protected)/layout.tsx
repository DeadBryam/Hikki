import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { AppLayout } from "@/components/layout/app-layout";
import { env } from "@/lib/utils/env";

export const metadata: Metadata = {
  description: "Your intelligent note management companion",
  title: {
    default: "",
    template: `${env.APP_NAME} | %s`,
  },
};

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
