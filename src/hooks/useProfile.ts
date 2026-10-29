import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/api';
import { NetworkType, User } from '@/types';

export const PROFILE_QUERY_KEYS = {
  profile: ['profile'] as const,
  wallets: ['wallets'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: () => profileService.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => profileService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile, updated);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      profileService.changePassword(data),
  });
}

export function useWallets() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.wallets,
    queryFn: () => profileService.getWallets(),
  });
}

export function useSaveWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wallet: {
      id?: string;
      address: string;
      network: NetworkType;
      label: string;
      isPrimary?: boolean;
    }) => profileService.saveWallet(wallet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.wallets });
    },
  });
}
