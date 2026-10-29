import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/api';
import { NetworkType } from '@/types';
import { CART_QUERY_KEYS } from './useCart';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  quote: ['checkout', 'quote'] as const,
};

export function useCheckoutQuote() {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.quote,
    queryFn: () => orderService.getQuote(),
    staleTime: 1000 * 15,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.all,
    queryFn: () => orderService.getOrders(),
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      walletId,
      network,
      simulateFailure,
      idempotencyKey,
    }: {
      walletId: string;
      network: NetworkType;
      simulateFailure?: boolean;
      idempotencyKey?: string;
    }) =>
      orderService.createOrder(
        { walletId, network, simulateFailure },
        idempotencyKey
      ),
    onSuccess: (newOrder) => {
      // Invalidate cart and orders lists
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      queryClient.setQueryData(ORDER_QUERY_KEYS.detail(newOrder.orderId), newOrder);
    },
  });
}
