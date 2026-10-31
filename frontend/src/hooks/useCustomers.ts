import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PaginatedResponse, type ListParams } from "@/lib/api";
import type { User } from "@/mocks/store";

export function useCustomers(params: ListParams = {}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => api.get<PaginatedResponse<User>>("/customers", params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => api.get<User>(`/customers/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) =>
      api.post<User>("/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
