import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PaginatedResponse, type ListParams } from "@/lib/api";
import type { Invoice } from "@/mocks/store";

export function useInvoices(params: ListParams = {}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => api.get<PaginatedResponse<Invoice>>("/invoices", params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: Boolean(id),
  });
}

export function useTransitionInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) =>
      api.post<Invoice>(`/invoices/${id}/transition`, { to }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useSendInvoice() {
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ sent: boolean; message: string }>(`/invoices/${id}/send`),
  });
}
