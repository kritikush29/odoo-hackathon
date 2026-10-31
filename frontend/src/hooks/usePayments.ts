import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Payment } from "@/mocks/store";

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      invoice_id: string;
      method: "UPI" | "NetBanking" | "Card" | "Cash" | "Bank";
      amount: number;
      date?: string;
      note?: string;
    }) => api.post<Payment>("/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
