"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  return (
    <header
      className={cn("flex h-14 items-center justify-between border-b border-border bg-card px-4")}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
