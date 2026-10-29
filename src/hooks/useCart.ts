import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/api';
import { CartSummary } from '@/types';

export const CART_QUERY_KEYS = {
  cart: ['cart'] as const,
};

export function useCart() {
  return useQuery({
    queryKey: CART_QUERY_KEYS.cart,
    queryFn: () => cartService.get(),
    staleTime: 1000 * 15, // 15s
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: { nftId: string; editionId: string; quantity: number }) =>
      cartService.addItem(item),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: { nftId: string; editionId: string; quantity: number }) =>
      cartService.updateQuantity(item),
    // Optimistic Update
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.cart });
      const previousCart = queryClient.getQueryData<CartSummary>(CART_QUERY_KEYS.cart);

      if (previousCart) {
        const updatedItems = previousCart.items
          .map((i) => {
            if (i.nftId === newItem.nftId && i.editionId === newItem.editionId) {
              const newQty = newItem.quantity;
              const unit = parseFloat(i.unitPriceEth);
              const total = (Math.round(unit * newQty * 10000) / 10000).toFixed(4);
              return { ...i, quantity: newQty, totalPriceEth: total };
            }
            return i;
          })
          .filter((i) => i.quantity > 0);

        queryClient.setQueryData<CartSummary>(CART_QUERY_KEYS.cart, {
          ...previousCart,
          items: updatedItems,
        });
      }

      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEYS.cart, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nftId, editionId }: { nftId: string; editionId: string }) =>
      cartService.removeItem(nftId, editionId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
    },
  });
}
