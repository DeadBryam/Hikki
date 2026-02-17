"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  PanelRight,
  Play,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cardHoverVariants, sidebarVariants } from "@/lib/animations";
import {
  formatJobTime,
  mockJobs,
  mockMemories,
  mockReminders,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function RightSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("memories");

  // Count items for badges
  const jobsRunning = mockJobs.filter((j) => j.status === "running").length;
  const remindersPending = mockReminders.filter((r) => !r.completed).length;

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={isOpen ? "expanded" : "collapsed"}
        className={cn(
          "relative flex h-full shrink-0 flex-col overflow-hidden border-border/50 border-l bg-sidebar/80 backdrop-blur-xl",
          !isOpen && "border-l-transparent"
        )}
        initial={false}
        variants={sidebarVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-border/50 border-b p-3">
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0 }}
            className="whitespace-nowrap font-semibold text-sm"
          >
            Context
          </motion.span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8 shrink-0"
                onClick={() => setIsOpen((prev) => !prev)}
                size="icon"
                variant="ghost"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isOpen ? "Collapse sidebar" : "Expand sidebar"}</p>
            </TooltipContent>
          </Tooltip>
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
                <div className="px-3 pt-2">
                  <TabsList className="grid h-8 w-full grid-cols-3">
                    <TabsTrigger className="relative text-xs" value="memories">
                      <Brain className="mr-1 h-3.5 w-3.5" />
                      Memories
                    </TabsTrigger>
                    <TabsTrigger className="relative text-xs" value="jobs">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      Jobs
                      {jobsRunning > 0 && (
                        <Badge
                          className="ml-1 h-4 min-w-4 px-1 text-[10px]"
                          variant="secondary"
                        >
                          {jobsRunning}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger className="relative text-xs" value="reminders">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Tasks
                      {remindersPending > 0 && (
                        <Badge
                          className="ml-1 h-4 min-w-4 px-1 text-[10px]"
                          variant="secondary"
                        >
                          {remindersPending}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 px-3 py-2">
                  {/* Memories Tab */}
                  <TabsContent className="mt-0 space-y-2" value="memories">
                    {mockMemories.map((memory) => (
                      <motion.div
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card p-3"
                        initial="rest"
                        key={memory.id}
                        variants={cardHoverVariants}
                        whileHover="hover"
                      >
                        <p className="mb-2 text-sm leading-relaxed">
                          {memory.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                          {memory.tags.map((tag) => (
                            <Badge
                              className="h-4 px-1.5 py-0 text-[10px]"
                              key={tag}
                              variant="secondary"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-muted-foreground text-xs">
                          {new Date(memory.date).toLocaleDateString()}
                        </p>

                        {/* Hover gradient */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.div>
                    ))}
                  </TabsContent>

                  {/* Jobs Tab */}
                  <TabsContent className="mt-0 space-y-2" value="jobs">
                    {mockJobs.map((job) => (
                      <motion.div
                        className={cn(
                          "group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-3",
                          job.status === "running" && "border-cyan-500/30",
                          job.status === "failed" && "border-red-500/30",
                          job.status === "pending" && "border-border/50",
                          job.status === "completed" && "border-green-500/30"
                        )}
                        initial="rest"
                        key={job.id}
                        variants={cardHoverVariants}
                        whileHover="hover"
                      >
                        <div className="mb-1 flex items-start justify-between">
                          <h4 className="font-medium text-sm">{job.name}</h4>
                          <StatusIcon status={job.status} />
                        </div>
                        <p className="mb-2 text-muted-foreground text-xs">
                          {job.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-muted-foreground">
                            {job.schedule}
                          </span>
                          <span
                            className={cn(
                              job.status === "running" && "text-cyan-400",
                              job.status === "failed" && "text-red-400"
                            )}
                          >
                            {job.status === "running"
                              ? "Running"
                              : formatJobTime(job.nextRun)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  {/* Reminders Tab */}
                  <TabsContent className="mt-0 space-y-2" value="reminders">
                    {mockReminders.map((reminder) => (
                      <motion.div
                        className={cn(
                          "group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl border border-border/50 bg-card p-3",
                          reminder.completed && "opacity-60"
                        )}
                        initial="rest"
                        key={reminder.id}
                        variants={cardHoverVariants}
                        whileHover="hover"
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                            reminder.completed
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30 hover:border-primary"
                          )}
                        >
                          {reminder.completed && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm",
                              reminder.completed &&
                                "text-muted-foreground line-through"
                            )}
                          >
                            {reminder.text}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              className={cn(
                                "h-4 px-1.5 py-0 text-[10px]",
                                reminder.priority === "high" &&
                                  "border-red-400/50 text-red-400",
                                reminder.priority === "medium" &&
                                  "border-amber-400/50 text-amber-400",
                                reminder.priority === "low" &&
                                  "border-green-400/50 text-green-400"
                              )}
                              variant="outline"
                            >
                              {reminder.priority}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {new Date(reminder.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-10 w-10 rounded-xl"
                    size="icon"
                    variant="ghost"
                  >
                    <Brain className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Memories</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="relative h-10 w-10 rounded-xl"
                    size="icon"
                    variant="ghost"
                  >
                    <Clock className="h-5 w-5" />
                    {jobsRunning > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 font-medium text-[10px] text-white">
                        {jobsRunning}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Jobs</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="relative h-10 w-10 rounded-xl"
                    size="icon"
                    variant="ghost"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {remindersPending > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 font-medium text-[10px] text-white">
                        {remindersPending}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Tasks</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "running":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
          <Play className="h-3 w-3 fill-cyan-400 text-cyan-400" />
        </div>
      );
    case "failed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
          <AlertCircle className="h-3 w-3 text-red-400" />
        </div>
      );
    case "completed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle2 className="h-3 w-3 text-green-400" />
        </div>
      );
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          <Clock className="h-3 w-3 text-muted-foreground" />
        </div>
      );
  }
}
