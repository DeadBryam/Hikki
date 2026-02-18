"use client";

import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { cn } from "@/lib/utils/misc";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0f1a]">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <main
        className={cn(
          "relative flex min-w-0 flex-1 flex-col",
          "transition-all duration-300 ease-out"
        )}
      >
        {children}
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
