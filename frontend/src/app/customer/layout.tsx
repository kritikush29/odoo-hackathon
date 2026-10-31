"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Receipt,
  CreditCard,
  SignOut,
} from "@phosphor-icons/react";
import { logout } from "@/lib/auth";

export default function CustomerLayout({
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
    { label: "Overview", href: "/customer", icon: House },
    { label: "Subscriptions", href: "/customer/subscriptions", icon: Receipt },
    { label: "Billing & Pay", href: "/customer/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-border p-6 flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-leaf bg-accent flex items-center justify-center text-surface font-semibold text-base">
              B
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-ink block leading-none">
                Brightloop
              </span>
              <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                Customer Portal
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/customer" && pathname.startsWith(item.href));
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
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-xs font-semibold text-ink shrink-0">
              CU
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-ink block truncate">
                Customer Account
              </span>
              <span className="text-[10px] text-muted block truncate">
                GST Registered
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

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-leaf bg-accent flex items-center justify-center text-surface font-semibold text-sm">
            B
          </div>
          <span className="font-semibold text-sm tracking-tight text-ink">
            Customer Portal
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-muted hover:text-ink font-medium px-2 py-1 rounded border border-border"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around py-2 px-4 z-40">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/customer" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-leaf ${
                active ? "text-primary font-semibold" : "text-muted"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
