import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Tax, Discount } from "@/mocks/store";

export function useTaxes() {
  return useQuery({
    queryKey: ["taxes"],
    queryFn: async () => {
      const res = await api.get<Tax[] | { items: Tax[] }>("/taxes");
      return Array.isArray(res) ? res : res.items || [];
    },
  });
}

export function useDiscounts() {
  return useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const res = await api.get<Discount[] | { items: Discount[] }>("/discounts");
      return Array.isArray(res) ? res : res.items || [];
    },
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Tax>) => api.post<Tax>("/taxes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
    },
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Discount>) =>
      api.post<Discount>("/discounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
}
