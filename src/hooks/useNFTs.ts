import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nftService } from '@/services/api';
import { NFTFilterParams, NFTItem } from '@/types';

export const NFT_QUERY_KEYS = {
  all: ['nfts'] as const,
  list: (params?: NFTFilterParams) => ['nfts', 'list', params] as const,
  detail: (id: string) => ['nfts', 'detail', id] as const,
};

export function useNFTs(params?: NFTFilterParams) {
  return useQuery({
    queryKey: NFT_QUERY_KEYS.list(params),
    queryFn: ({ signal }) => nftService.getAll(params, signal),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useNFTDetail(id: string) {
  return useQuery({
    queryKey: NFT_QUERY_KEYS.detail(id),
    queryFn: ({ signal }) => nftService.getById(id, signal),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => nftService.toggleFavorite(id),
    // Optimistic Update
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NFT_QUERY_KEYS.all });

      // Optimistically update detail
      const previousDetail = queryClient.getQueryData<NFTItem>(NFT_QUERY_KEYS.detail(id));
      if (previousDetail) {
        queryClient.setQueryData<NFTItem>(NFT_QUERY_KEYS.detail(id), {
          ...previousDetail,
          isLiked: !previousDetail.isLiked,
          likesCount: previousDetail.isLiked
            ? Math.max(0, previousDetail.likesCount - 1)
            : previousDetail.likesCount + 1,
        });
      }

      return { previousDetail };
    },
    onError: (_err, id, context) => {
      // Rollback on failure
      if (context?.previousDetail) {
        queryClient.setQueryData(NFT_QUERY_KEYS.detail(id), context.previousDetail);
      }
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: NFT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: NFT_QUERY_KEYS.all });
    },
  });
}
