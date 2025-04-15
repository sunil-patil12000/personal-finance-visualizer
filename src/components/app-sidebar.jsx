'use client';

import { LayoutDashboard, LineChart, Wallet, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <Sidebar>
      <div className="flex h-full w-full flex-col gap-6 p-2">
        <div className="flex items-center gap-2 px-2 pt-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="font-semibold leading-none tracking-tight">Finance Visualizer</div>
        </div>
        <Separator />
        <nav className="grid gap-1">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              isActive("/")
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-zinc-600 hover:bg-secondary hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              isActive("/transactions")
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-zinc-600 hover:bg-secondary hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <Wallet className="h-4 w-4" />
            Transactions
          </Link>
          <Link
            href="/budgets"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              isActive("/budgets")
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-zinc-600 hover:bg-secondary hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <LineChart className="h-4 w-4" />
            Budgets
          </Link>
        </nav>
        <Separator />
        <div className="mt-auto">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              © 2025 Personal Finance
            </div>
            <Link
              href="#"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Sidebar>
  );
} 