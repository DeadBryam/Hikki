import { Archive, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/misc";

interface SidebarFiltersProps {
  isOpen: boolean;
  onArchivedToggle: () => void;
  onSearchChange: (value: string) => void;
  searchQuery: string;
  showArchived: boolean;
}

export function SidebarFilters({
  isOpen,
  searchQuery,
  showArchived,
  onSearchChange,
  onArchivedToggle,
}: SidebarFiltersProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="space-y-2 px-2 pb-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pr-8 pl-8 text-sm"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations..."
          value={searchQuery}
        />
        {searchQuery && (
          <Button
            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
            onClick={() => onSearchChange("")}
            size="icon"
            variant="ghost"
          >
            ×
          </Button>
        )}
      </div>
      <Button
        className={cn(
          "w-full justify-start gap-2 text-sm",
          showArchived && "bg-muted"
        )}
        onClick={onArchivedToggle}
        variant="ghost"
      >
        <Archive className="h-4 w-4" />
        {showArchived ? "Hide" : "Show"} archived
      </Button>
    </div>
  );
}
