import { api } from '@/lib/axios';
import {
  AuthSession,
  User,
  NFTItem,
  NFTFilterParams,
  PaginatedResponse,
  CartSummary,
  OrderReceipt,
  NetworkType,
  Wallet,
} from '@/types';

// Auth Services
export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthSession> => {
    const response = await api.post<AuthSession>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<AuthSession> => {
    const response = await api.post<AuthSession>('/auth/register', data);
    return response.data;
  },

  me: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
    return response.data;
  },
};

// NFT Services
export const nftService = {
  getAll: async (params?: NFTFilterParams, signal?: AbortSignal): Promise<PaginatedResponse<NFTItem>> => {
    const response = await api.get<PaginatedResponse<NFTItem>>('/nfts', {
      params,
      signal,
    });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<NFTItem> => {
    const response = await api.get<NFTItem>(`/nfts/${id}`, { signal });
    return response.data;
  },

  toggleFavorite: async (
    id: string
  ): Promise<{ nftId: string; isLiked: boolean; likesCount: number }> => {
    const response = await api.post<{ nftId: string; isLiked: boolean; likesCount: number }>(
      `/nfts/${id}/favorite`
    );
    return response.data;
  },
};

// Cart Services
export const cartService = {
  get: async (): Promise<CartSummary> => {
    const response = await api.get<CartSummary>('/cart');
    return response.data;
  },

  addItem: async (item: {
    nftId: string;
    editionId: string;
    quantity: number;
  }): Promise<CartSummary> => {
    const response = await api.post<CartSummary>('/cart/items', item);
    return response.data;
  },

  updateQuantity: async (item: {
    nftId: string;
    editionId: string;
    quantity: number;
  }): Promise<CartSummary> => {
    const response = await api.patch<CartSummary>('/cart/items', item);
    return response.data;
  },

  removeItem: async (nftId: string, editionId: string): Promise<CartSummary> => {
    const response = await api.delete<CartSummary>(`/cart/items/${nftId}/${editionId}`);
    return response.data;
  },

  applyCoupon: async (code: string): Promise<CartSummary> => {
    const response = await api.post<CartSummary>('/cart/coupon', { code });
    return response.data;
  },

  removeCoupon: async (): Promise<CartSummary> => {
    const response = await api.delete<CartSummary>('/cart/coupon');
    return response.data;
  },
};

// Checkout & Orders Services
export const orderService = {
  getQuote: async (): Promise<{
    subtotalEth: string;
    discountEth: string;
    networkFeeEth: string;
    totalEth: string;
    validUntil: string;
  }> => {
    const response = await api.post('/checkout/quote');
    return response.data;
  },

  createOrder: async (
    data: {
      walletId: string;
      network: NetworkType;
      simulateFailure?: boolean;
    },
    idempotencyKey?: string
  ): Promise<OrderReceipt> => {
    const response = await api.post<OrderReceipt>('/checkout/orders', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
    return response.data;
  },

  getOrders: async (): Promise<OrderReceipt[]> => {
    const response = await api.get<OrderReceipt[]>('/orders');
    return response.data;
  },

  getOrderById: async (id: string): Promise<OrderReceipt> => {
    const response = await api.get<OrderReceipt>(`/orders/${id}`);
    return response.data;
  },
};

// Profile & Wallets Services
export const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/profile', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/profile/change-password', data);
    return response.data;
  },

  getWallets: async (): Promise<Wallet[]> => {
    const response = await api.get<Wallet[]>('/wallets');
    return response.data;
  },

  saveWallet: async (wallet: {
    id?: string;
    address: string;
    network: NetworkType;
    label: string;
    isPrimary?: boolean;
  }): Promise<Wallet> => {
    const response = await api.post<Wallet>('/wallets', wallet);
    return response.data;
  },
};
