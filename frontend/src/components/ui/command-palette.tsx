"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  Receipt,
  Users,
  Package,
  Gear,
  SignOut,
  House,
  Coins,
  Play,
} from "@phosphor-icons/react";
import { logout } from "@/lib/auth";

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette({ role }: { role: "admin" | "staff" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const items: CommandItem[] = [
    {
      id: "home",
      label: "Dashboard overview",
      category: "Navigation",
      icon: House,
      action: () => router.push(role === "admin" ? "/admin" : "/staff"),
    },
    {
      id: "subs",
      label: "Manage subscriptions",
      category: "Billing",
      icon: Receipt,
      action: () =>
        router.push(role === "admin" ? "/admin/products" : "/staff/subscriptions"),
    },
    {
      id: "invs",
      label: "Invoices ledger",
      category: "Billing",
      icon: Coins,
      action: () =>
        router.push(role === "admin" ? "/admin" : "/staff/invoices"),
    },
    {
      id: "customers",
      label: "Customer directory",
      category: "Directory",
      icon: Users,
      action: () => router.push("/staff/customers"),
    },
    ...(role === "admin"
      ? [
          {
            id: "products",
            label: "Products & Plan builder",
            category: "Catalog",
            icon: Package,
            action: () => router.push("/admin/products"),
          },
          {
            id: "taxes",
            label: "GST Rules & Discounts",
            category: "Finance",
            icon: Gear,
            action: () => router.push("/admin/discounts-taxes"),
          },
          {
            id: "team",
            label: "Team management",
            category: "Settings",
            icon: Users,
            action: () => router.push("/admin/team"),
          },
        ]
      : [
          {
            id: "billing-day",
            label: "Execute Billing Day",
            category: "Actions",
            icon: Play,
            action: () => router.push("/staff/invoices?action=billing-day"),
          },
        ]),
    {
      id: "logout",
      label: "Sign out of Brightloop",
      category: "Account",
      icon: SignOut,
      action: async () => {
        await logout();
        router.push("/login");
      },
    },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        className="fixed inset-0 bg-ink/20"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-surface border border-border shape-leaf overflow-hidden z-10">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-paper/50">
          <MagnifyingGlass size={18} className="text-muted" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands, pages, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="text-[10px] bg-sand/60 px-1.5 py-0.5 rounded border border-border text-muted font-mono-tabular">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No matching commands
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-leaf hover:bg-sand/40 transition-colors text-sm text-ink group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-muted group-hover:text-primary" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[11px] text-muted font-mono-tabular">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
