"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  Receipt,
  Coins,
  SignOut,
  MagnifyingGlass,
  Play,
} from "@phosphor-icons/react";
import { logout } from "@/lib/auth";
import { CommandPalette } from "@/components/ui/command-palette";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/staff", icon: SquaresFour },
    { label: "Customers", href: "/staff/customers", icon: Users },
    { label: "Subscriptions", href: "/staff/subscriptions", icon: Receipt },
    { label: "Invoices", href: "/staff/invoices", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <CommandPalette role="staff" />

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/staff" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-leaf bg-confirmed flex items-center justify-center text-surface font-semibold text-base">
                B
              </div>
              <div>
                <span className="font-semibold text-base tracking-tight text-ink block leading-none">
                  Brightloop
                </span>
                <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                  Operations & Staff
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Ctrl+K Search button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
              );
            }}
            className="w-full mb-6 px-3 py-2 bg-paper hover:bg-sand/40 border border-border rounded-leaf flex items-center justify-between text-xs text-muted transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MagnifyingGlass size={14} />
              <span>Search & actions...</span>
            </div>
            <kbd className="text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-ink font-mono-tabular">
              Ctrl+K
            </kbd>
          </button>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/staff" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-leaf text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-surface"
                      : "text-muted hover:text-ink hover:bg-sand/30"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Billing day shortcut */}
          <div className="mt-6 pt-6 border-t border-border">
            <Link
              href="/staff/invoices?action=billing-day"
              className="flex items-center justify-between px-3.5 py-2.5 bg-paper hover:bg-sand/50 border border-border rounded-leaf text-xs font-semibold text-ink transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Play size={14} className="text-accent group-hover:scale-110 transition-transform" />
                <span>Run Billing Day</span>
              </div>
              <span className="text-[10px] text-muted font-mono-tabular">Idempotent</span>
            </Link>
          </div>
        </div>

        {/* User profile & sign out */}
        <div className="pt-6 border-t border-border mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-xs font-semibold text-ink shrink-0">
              ST
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-ink block truncate">
                Staff Operator
              </span>
              <span className="text-[10px] text-muted block truncate">
                staff1@brightloop.in
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-muted hover:text-status-overdue transition-colors rounded-leaf hover:bg-sand/30 cursor-pointer"
          >
            <SignOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
