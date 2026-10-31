import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PaginatedResponse, type ListParams } from "@/lib/api";
import type { Product, Plan, Variant } from "@/mocks/store";

export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.get<PaginatedResponse<Product>>("/products", params),
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get<Plan[] | { items: Plan[] }>("/plans");
      return Array.isArray(res) ? res : res.items || [];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      api.post<Product>("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<Variant> }) =>
      api.post<Variant>(`/products/${productId}/variants`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Plan>) =>
      api.post<Plan>("/plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}
