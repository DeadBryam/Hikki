"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      aria-label="Go back to previous page"
      className="fade-in slide-in-from-left-4 mb-6 animate-in gap-2 duration-500"
      onClick={() => router.back()}
      size="lg"
      variant="ghost"
    >
      <ChevronLeft className="h-5 w-5" />
      Back
    </Button>
  );
}
