"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TopProgress } from "@/components/ui/top-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [mswReady, setMswReady] = useState(
    process.env.NEXT_PUBLIC_USE_MOCK !== "true"
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      import("@/mocks/browser")
        .then(({ worker }) => {
          return worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          });
        })
        .then(() => {
          setMswReady(true);
        })
        .catch((err) => {
          console.error("Failed to start MSW worker:", err);
          setMswReady(true);
        });
    }
  }, []);

  if (!mswReady) {
    // Show a minimal, calm leaf-cornered indicator on initial cold mock boot
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="bg-surface border border-border shape-leaf px-6 py-4 flex items-center gap-3">
          <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-ink">
            Initializing Brightloop mock ledger...
          </span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TopProgress />
      {children}
    </QueryClientProvider>
  );
}
