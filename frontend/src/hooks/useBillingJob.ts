import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BillingJob } from "@/mocks/store";

export function useRunBillingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetDate?: string) =>
      api.post<{ job_id: string }>("/billing/run", { targetDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useBillingJobStatus(jobId: string | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["billing-job", jobId],
    queryFn: () => api.get<BillingJob>(`/billing/jobs/${jobId}`),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1000;
      if (data.status === "completed" || data.status === "failed") {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        return false;
      }
      return 1000; // poll every second
    },
  });
}
