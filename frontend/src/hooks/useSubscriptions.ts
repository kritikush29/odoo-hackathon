import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PaginatedResponse, type ListParams } from "@/lib/api";
import type { Subscription } from "@/mocks/store";

export function useSubscriptions(params: ListParams = {}) {
  return useQuery({
    queryKey: ["subscriptions", params],
    queryFn: () =>
      api.get<PaginatedResponse<Subscription>>("/subscriptions", params),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ["subscription", id],
    queryFn: () => api.get<Subscription>(`/subscriptions/${id}`),
    enabled: Boolean(id),
  });
}

export function useTransitionSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) =>
      api.post<Subscription>(`/subscriptions/${id}/transition`, { to }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useCreateSubscriptionFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      templateId?: string;
      customerId: string;
      planId: string;
      productId: string;
      quantity: number;
    }) => api.post<Subscription>("/subscriptions/from-template", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}
