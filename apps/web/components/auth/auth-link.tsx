import Link from "next/link";
import { cn } from "@/lib/utils/misc";

interface AuthLinkProps {
  className?: string;
  href: string;
  linkText: string;
  text: string;
}

function AuthLink({ href, text, linkText, className }: AuthLinkProps) {
  return (
    <p className={cn("text-center text-muted-foreground text-sm", className)}>
      {text}{" "}
      <Link
        className="font-medium text-primary transition-colors hover:underline"
        href={href}
      >
        {linkText}
      </Link>
    </p>
  );
}

export { AuthLink };
export type { AuthLinkProps };
