export type NetworkType = 'ethereum' | 'polygon' | 'arbitrum';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  network: NetworkType;
  isPrimary: boolean;
  label: string;
  balanceEth: string; // Decimal string e.g. "4.2500"
}

export interface NFTEdition {
  id: string;
  editionNumber: number;
  totalEditions: number;
  priceEth: string; // Decimal string e.g. "0.450"
  availableQuantity: number;
  maxQuantityPerUser: number;
  status: 'available' | 'sold_out' | 'reserved';
}

export interface NFTAttribute {
  traitType: string;
  value: string;
  rarityPercentage?: number;
}

export interface NFTItem {
  id: string;
  tokenId: string;
  name: string;
  collection: string;
  collectionSlug: string;
  description: string;
  imageUrl: string;
  creator: {
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  attributes: NFTAttribute[];
  priceEth: string; // Current / starting price in decimal string
  currency: 'ETH';
  editions: NFTEdition[];
  isFeatured?: boolean;
  isTrending?: boolean;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface CartItem {
  nftId: string;
  editionId: string;
  editionNumber: number;
  name: string;
  collection: string;
  imageUrl: string;
  unitPriceEth: string; // Decimal string
  quantity: number;
  availableQuantity: number;
  totalPriceEth: string; // Decimal string
}

export interface AppliedCoupon {
  code: string;
  discountPercentage: number;
  maxDiscountEth?: string;
  expiresAt: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  appliedCoupon?: AppliedCoupon;
}

export type OrderStatus = 'pending' | 'confirmed' | 'failed';

export interface OrderItem {
  nftId: string;
  editionId: string;
  editionNumber: number;
  name: string;
  collection: string;
  imageUrl: string;
  unitPriceEth: string;
  quantity: number;
  totalPriceEth: string;
}

export interface OrderReceipt {
  orderId: string;
  userId: string;
  walletAddress: string;
  network: NetworkType;
  transactionHash: string;
  explorerUrl: string;
  items: OrderItem[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  status: OrderStatus;
  failureReason?: string;
  createdAt: string;
  idempotencyKey?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface NFTFilterParams extends PaginationParams {
  search?: string;
  collection?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: 'all' | 'available' | 'sold_out';
  sortBy?: 'price_asc' | 'price_desc' | 'recent' | 'likes';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthSession {
  user: User;
  token: string;
}

// Socket.IO Real-time Events
export interface NFTUpdatedEvent {
  nftId: string;
  editionId?: string;
  newPriceEth?: string;
  availableQuantity?: number;
  status?: 'available' | 'sold_out' | 'reserved';
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: OrderStatus;
  transactionHash?: string;
}
