"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, Check, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface SlashCommandItem {
  command: string;
  description: string;
  label: string;
  type: "memory" | "forget" | "list";
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    command: "/memory",
    label: "Save Memory",
    description: "Save important information to memory",
    type: "memory",
  },
  {
    command: "/memories",
    label: "List Memories",
    description: "Show all saved memories",
    type: "list",
  },
  {
    command: "/forget",
    label: "Delete Memory",
    description: "Remove a memory by ID or content",
    type: "forget",
  },
];

interface SlashCommandsDropdownProps {
  onChange: (value: string) => void;
  onCommand: (command: string, args?: string) => void;
  value: string;
}

export function SlashCommandsDropdown({
  value: _value,
  onChange: _onChange,
  onCommand,
}: SlashCommandsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(
    () =>
      SLASH_COMMANDS.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          cmd.command.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "/" && _value === "") {
        setIsOpen(true);
        setInputValue("");
        setSelectedIndex(0);
        return;
      }

      if (!isOpen) {
        return;
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onCommand(filteredCommands[selectedIndex].command);
            setIsOpen(false);
            setInputValue("");
          }
          break;
        }
        case "Escape": {
          setIsOpen(false);
          break;
        }
        default:
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, _value, onCommand]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: inputValue is intentionally included to reset selection when filtering
  useEffect(() => {
    setSelectedIndex(0);
  }, [inputValue]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 -top-full z-50 flex items-start justify-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl"
            ref={dropdownRef}
          >
            <div className="flex items-center gap-2 border-border/50 border-b p-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search commands..."
                type="search"
                value={inputValue}
              />
              <button onClick={() => setIsOpen(false)} type="button">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-1">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No commands found
                </div>
              ) : (
                filteredCommands.map((cmd, index) => (
                  <button
                    className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                    key={cmd.command}
                    onClick={() => {
                      onCommand(cmd.command);
                      setIsOpen(false);
                      setInputValue("");
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    type="button"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {cmd.type === "memory" && (
                        <Brain className="h-4 w-4 text-primary" />
                      )}
                      {cmd.type === "list" && (
                        <Search className="h-4 w-4 text-primary" />
                      )}
                      {cmd.type === "forget" && (
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{cmd.label}</span>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                          {cmd.command}
                        </code>
                      </div>
                      <p className="mt-0.5 truncate text-muted-foreground text-xs">
                        {cmd.description}
                      </p>
                    </div>
                    {index === selectedIndex && (
                      <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MemoryChip({
  command,
  args,
  onRemove,
}: {
  command: string;
  args?: string;
  onRemove: () => void;
}) {
  const getIcon = () => {
    switch (command) {
      case "/memory":
        return <Brain className="h-3 w-3" />;
      case "/memories":
        return <Search className="h-3 w-3" />;
      case "/forget":
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Brain className="h-3 w-3" />;
    }
  };

  const getLabel = () => {
    const cmd = SLASH_COMMANDS.find((c) => c.command === command);
    return cmd?.label || command;
  };

  return (
    <Badge
      className="flex items-center gap-1.5 px-2 py-1 pr-1"
      variant="secondary"
    >
      {getIcon()}
      <span className="text-xs">{getLabel()}</span>
      {args && (
        <span className="max-w-[100px] truncate text-xs opacity-70">
          {args}
        </span>
      )}
      <button
        className="ml-1 rounded p-0.5 hover:bg-muted"
        onClick={onRemove}
        type="button"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
