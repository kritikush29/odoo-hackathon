import { useQuery } from "@tanstack/react-query";
import { api, type PaginatedResponse, type ListParams } from "@/lib/api";
import type { Invoice } from "@/mocks/store";

export interface SummaryReport {
  activeSubscriptions: number;
  totalRevenue: number;
  collectedRevenue: number;
  outstandingBalance: number;
  overdueCount: number;
  timeSeries: { date: string; revenue: number; collected: number }[];
}

export function useSummaryReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", "summary", from, to],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      return api.get<SummaryReport>("/reports/summary", params);
    },
  });
}

export function useOverdueReport(params: ListParams = {}) {
  return useQuery({
    queryKey: ["reports", "overdue", params],
    queryFn: () =>
      api.get<PaginatedResponse<Invoice & { daysOverdue: number }>>(
        "/reports/overdue",
        params
      ),
  });
}
