"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { GlobalSearch } from "@/components/search/GlobalSearch";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/sheets": "My Sheets",
  "/sheets/import": "Import Sheet",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  // Check prefix matches for nested routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + "/")) {
      return title;
    }
  }
  return "ChordSheet";
}

interface AppShellProps {
  displayName: string;
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <GlobalSearch />
    </div>
  );
}
