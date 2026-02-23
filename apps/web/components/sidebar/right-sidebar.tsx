"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, CheckCircle2, Clock, PanelRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { sidebarVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";
import { MemoriesTab } from "./tabs/memories-tab";

export function RightSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("memories");

  return (
    <motion.aside
      animate={isOpen ? "expanded" : "collapsed"}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden border-border/50 border-l bg-sidebar/80 backdrop-blur-xl",
        !isOpen && "min-w-15 border-l-transparent"
      )}
      initial={false}
      variants={sidebarVariants}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-border/50 border-b p-3",
          isOpen ? "justify-between" : "justify-center"
        )}
      >
        <motion.span
          animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
          className="overflow-hidden whitespace-nowrap font-semibold text-sm"
        >
          Panel
        </motion.span>

        <Button
          className="h-8 w-8 shrink-0"
          data-tooltip-content={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          data-tooltip-id="toggle-sidebar"
          data-tooltip-place="bottom"
          onClick={() => setIsOpen((prev) => !prev)}
          size="icon"
          variant="ghost"
        >
          <PanelRight
            className={cn(
              "h-4 w-4 transition-transform",
              !isOpen && "rotate-180"
            )}
          />
        </Button>
        <Tooltip id="toggle-sidebar" />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col overflow-hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="content"
            transition={{ duration: 0.15 }}
          >
            <Tabs
              className="flex flex-1 flex-col"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="flex w-full gap-1 rounded-none! border-border/50 border-b p-1!">
                <TabsTrigger
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-accent data-[state=active]:bg-accent"
                  value="memories"
                >
                  <span>Memories</span>
                </TabsTrigger>
                <TabsTrigger
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-accent data-[state=active]:bg-accent"
                  value="jobs"
                >
                  <span>Jobs</span>
                </TabsTrigger>
                <TabsTrigger
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-accent data-[state=active]:bg-accent"
                  value="tasks"
                >
                  <span>Tasks</span>
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 px-3 py-2">
                <TabsContent value="memories">
                  <MemoriesTab />
                </TabsContent>
                <TabsContent
                  className="flex h-full flex-col items-center justify-center gap-2 py-8 text-muted-foreground"
                  value="jobs"
                >
                  <Clock className="h-8 w-8 opacity-50" />
                  <p className="text-sm">No active jobs</p>
                </TabsContent>
                <TabsContent
                  className="flex h-full flex-col items-center justify-center gap-2 py-8 text-muted-foreground"
                  value="tasks"
                >
                  <CheckCircle2 className="h-8 w-8 opacity-50" />
                  <p className="text-sm">No tasks yet</p>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center gap-2 py-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="collapsed"
          >
            <Button
              className="h-10 w-10 rounded-xl"
              data-tooltip-content="Memories"
              data-tooltip-id="tab-memories"
              data-tooltip-place="left"
              onClick={() => {
                setActiveTab("memories");
                setIsOpen(true);
              }}
              size="icon"
              variant="ghost"
            >
              <Brain className="h-5 w-5" />
            </Button>
            <Tooltip id="tab-memories" />

            <Button
              className="relative h-10 w-10 rounded-xl"
              data-tooltip-content="Jobs"
              data-tooltip-id="tab-jobs"
              data-tooltip-place="left"
              onClick={() => {
                setActiveTab("jobs");
                setIsOpen(true);
              }}
              size="icon"
              variant="ghost"
            >
              <Clock className="h-5 w-5" />
            </Button>
            <Tooltip id="tab-jobs" />

            <Button
              className="relative h-10 w-10 rounded-xl"
              data-tooltip-content="Tasks"
              data-tooltip-id="tab-tasks"
              data-tooltip-place="left"
              onClick={() => {
                setActiveTab("tasks");
                setIsOpen(true);
              }}
              size="icon"
              variant="ghost"
            >
              <CheckCircle2 className="h-5 w-5" />
            </Button>
            <Tooltip id="tab-tasks" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
