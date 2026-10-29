import {
  User,
  Wallet,
  NFTItem,
  AppliedCoupon,
  CartItem,
  CartSummary,
  OrderReceipt,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_WALLETS,
  INITIAL_COUPONS,
  INITIAL_NFTS,
} from './fixtures';

const STORAGE_KEYS = {
  USERS: 'greenmint_db2_users',
  WALLETS: 'greenmint_db2_wallets',
  NFTS: 'greenmint_db2_nfts',
  CARTS: 'greenmint_db2_carts',
  ORDERS: 'greenmint_db2_orders',
  FAVORITES: 'greenmint_db2_favorites',
  SESSION: 'greenmint_auth_session',
  PROCESSED_IDEMPOTENCY: 'greenmint_db2_idempotency_keys',
};

export function ethAdd(a: string, b: string): string {
  const sum = Math.round((parseFloat(a) + parseFloat(b)) * 10000) / 10000;
  return sum.toFixed(4);
}

export function ethMultiply(a: string, count: number): string {
  const total = Math.round(parseFloat(a) * count * 10000) / 10000;
  return total.toFixed(4);
}

export function ethSubtract(a: string, b: string): string {
  const diff = Math.max(0, Math.round((parseFloat(a) - parseFloat(b)) * 10000) / 10000);
  return diff.toFixed(4);
}

class MockDatabase {
  private users: (User & { passwordHash: string })[] = [];
  private wallets: Wallet[] = [];
  private nfts: NFTItem[] = [];
  private carts: Record<string, { items: CartItem[]; coupon?: AppliedCoupon }> = {};
  private orders: OrderReceipt[] = [];
  private favorites: Record<string, string[]> = {};
  private idempotencyStore: Record<string, OrderReceipt> = {};

  constructor() {
    this.restore();
  }

  restore() {
    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.wallets = this.load(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
    this.nfts = this.load(STORAGE_KEYS.NFTS, INITIAL_NFTS);
    this.carts = this.load(STORAGE_KEYS.CARTS, { guest: { items: [] } });
    this.orders = this.load(STORAGE_KEYS.ORDERS, []);
    this.favorites = this.load(STORAGE_KEYS.FAVORITES, { user_1: ['nft_1', 'nft_2'] });
    this.idempotencyStore = this.load(STORAGE_KEYS.PROCESSED_IDEMPOTENCY, {});
  }

  private load<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) return JSON.parse(item);
      }
    } catch {
      // Fallback on storage errors
    }
    return JSON.parse(JSON.stringify(fallback));
  }

  private save<T>(key: string, data: T) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // Ignore storage quota errors in mock
    }
  }

  init() {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    }
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.wallets = JSON.parse(JSON.stringify(INITIAL_WALLETS));
    this.nfts = JSON.parse(JSON.stringify(INITIAL_NFTS));
    this.carts = { guest: { items: [] } };
    this.orders = [];
    this.favorites = { user_1: ['nft_1', 'nft_2'] };
    this.idempotencyStore = {};
  }

  getUsers() {
    return this.users;
  }

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }) {
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      this.save(STORAGE_KEYS.USERS, this.users);
      return this.users[idx];
    }
    return null;
  }

  getUserWallets(userId: string) {
    return this.wallets.filter((w) => w.userId === userId);
  }

  saveWallet(wallet: Omit<Wallet, 'id'> & { id?: string }) {
    if (wallet.id) {
      const idx = this.wallets.findIndex((w) => w.id === wallet.id);
      if (idx !== -1) {
        if (wallet.isPrimary) {
          this.wallets.forEach((w) => {
            if (w.userId === wallet.userId) w.isPrimary = false;
          });
        }
        this.wallets[idx] = { ...this.wallets[idx], ...wallet };
        this.save(STORAGE_KEYS.WALLETS, this.wallets);
        return this.wallets[idx];
      }
    }

    const newWallet: Wallet = {
      ...wallet,
      id: `wallet_${Date.now()}`,
    };

    if (newWallet.isPrimary) {
      this.wallets.forEach((w) => {
        if (w.userId === newWallet.userId) w.isPrimary = false;
      });
    }

    this.wallets.push(newWallet);
    this.save(STORAGE_KEYS.WALLETS, this.wallets);
    return newWallet;
  }

  getNFTs() {
    return this.nfts;
  }

  getNFTById(id: string) {
    return this.nfts.find((n) => n.id === id);
  }

  updateNFT(id: string, updates: Partial<NFTItem>) {
    const idx = this.nfts.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.nfts[idx] = { ...this.nfts[idx], ...updates };
      this.save(STORAGE_KEYS.NFTS, this.nfts);
      return this.nfts[idx];
    }
    return null;
  }

  updateNFTEdition(
    nftId: string,
    editionId: string,
    updates: { availableQuantity?: number; priceEth?: string; status?: 'available' | 'sold_out' | 'reserved' }
  ) {
    const nft = this.nfts.find((n) => n.id === nftId);
    if (!nft) return null;
    const edition = nft.editions.find((e) => e.id === editionId);
    if (!edition) return null;

    Object.assign(edition, updates);
    if (edition.availableQuantity === 0) {
      edition.status = 'sold_out';
    }
    this.save(STORAGE_KEYS.NFTS, this.nfts);
    return { nft, edition };
  }

  getFavorites(userId: string) {
    return this.favorites[userId] || [];
  }

  toggleFavorite(userId: string, nftId: string): boolean {
    if (!this.favorites[userId]) {
      this.favorites[userId] = [];
    }
    const idx = this.favorites[userId].indexOf(nftId);
    const nft = this.getNFTById(nftId);
    let isFavorited = false;

    if (idx !== -1) {
      this.favorites[userId].splice(idx, 1);
      if (nft) nft.likesCount = Math.max(0, nft.likesCount - 1);
    } else {
      this.favorites[userId].push(nftId);
      if (nft) nft.likesCount += 1;
      isFavorited = true;
    }

    this.save(STORAGE_KEYS.FAVORITES, this.favorites);
    this.save(STORAGE_KEYS.NFTS, this.nfts);
    return isFavorited;
  }

  getCart(cartKey: string): CartSummary {
    if (!this.carts[cartKey]) {
      this.carts[cartKey] = { items: [] };
    }
    const cart = this.carts[cartKey];

    let subtotalNum = 0;
    cart.items.forEach((item) => {
      subtotalNum += parseFloat(item.unitPriceEth) * item.quantity;
    });
    const subtotalEth = (Math.round(subtotalNum * 10000) / 10000).toFixed(4);

    let discountEth = '0.0000';
    if (cart.coupon) {
      const discountVal = (subtotalNum * cart.coupon.discountPercentage) / 100;
      const maxVal = cart.coupon.maxDiscountEth ? parseFloat(cart.coupon.maxDiscountEth) : Infinity;
      const applied = Math.min(discountVal, maxVal);
      discountEth = (Math.round(applied * 10000) / 10000).toFixed(4);
    }

    const networkFeeEth = cart.items.length > 0 ? '0.0045' : '0.0000';
    const totalNum = Math.max(0, parseFloat(subtotalEth) - parseFloat(discountEth) + parseFloat(networkFeeEth));
    const totalEth = (Math.round(totalNum * 10000) / 10000).toFixed(4);

    return {
      items: cart.items,
      subtotalEth,
      discountEth,
      networkFeeEth,
      totalEth,
      appliedCoupon: cart.coupon,
    };
  }

  addToCart(cartKey: string, item: Omit<CartItem, 'totalPriceEth'>) {
    if (!this.carts[cartKey]) {
      this.carts[cartKey] = { items: [] };
    }
    const cart = this.carts[cartKey];
    const existing = cart.items.find(
      (i) => i.nftId === item.nftId && i.editionId === item.editionId
    );

    if (existing) {
      const newQty = Math.min(existing.quantity + item.quantity, item.availableQuantity);
      existing.quantity = newQty;
      existing.totalPriceEth = ethMultiply(existing.unitPriceEth, existing.quantity);
    } else {
      cart.items.push({
        ...item,
        totalPriceEth: ethMultiply(item.unitPriceEth, item.quantity),
      });
    }

    this.save(STORAGE_KEYS.CARTS, this.carts);
    return this.getCart(cartKey);
  }

  updateCartQuantity(cartKey: string, nftId: string, editionId: string, quantity: number) {
    if (!this.carts[cartKey]) return this.getCart(cartKey);
    const cart = this.carts[cartKey];

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => !(i.nftId === nftId && i.editionId === editionId));
    } else {
      const item = cart.items.find((i) => i.nftId === nftId && i.editionId === editionId);
      if (item) {
        item.quantity = Math.min(quantity, item.availableQuantity);
        item.totalPriceEth = ethMultiply(item.unitPriceEth, item.quantity);
      }
    }

    this.save(STORAGE_KEYS.CARTS, this.carts);
    return this.getCart(cartKey);
  }

  removeFromCart(cartKey: string, nftId: string, editionId: string) {
    return this.updateCartQuantity(cartKey, nftId, editionId, 0);
  }

  applyCoupon(cartKey: string, couponCode: string): { success: boolean; message?: string; cart: CartSummary } {
    if (!this.carts[cartKey]) {
      this.carts[cartKey] = { items: [] };
    }
    const cart = this.carts[cartKey];
    const coupon = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (!coupon) {
      return { success: false, message: 'Cupom não encontrado ou inválido.', cart: this.getCart(cartKey) };
    }

    if (new Date(coupon.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'Este cupom já expirou.', cart: this.getCart(cartKey) };
    }

    cart.coupon = coupon;
    this.save(STORAGE_KEYS.CARTS, this.carts);
    return { success: true, cart: this.getCart(cartKey) };
  }

  removeCoupon(cartKey: string) {
    if (this.carts[cartKey]) {
      delete this.carts[cartKey].coupon;
      this.save(STORAGE_KEYS.CARTS, this.carts);
    }
    return this.getCart(cartKey);
  }

  mergeGuestCartIntoUser(userId: string) {
    const guestCart = this.carts['guest'];
    if (!guestCart || guestCart.items.length === 0) return;

    if (!this.carts[userId]) {
      this.carts[userId] = { items: [] };
    }
    const userCart = this.carts[userId];

    guestCart.items.forEach((guestItem) => {
      const existing = userCart.items.find(
        (i) => i.nftId === guestItem.nftId && i.editionId === guestItem.editionId
      );
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + guestItem.quantity,
          guestItem.availableQuantity
        );
        existing.totalPriceEth = ethMultiply(existing.unitPriceEth, existing.quantity);
      } else {
        userCart.items.push(guestItem);
      }
    });

    if (guestCart.coupon && !userCart.coupon) {
      userCart.coupon = guestCart.coupon;
    }

    this.carts['guest'] = { items: [] };
    this.save(STORAGE_KEYS.CARTS, this.carts);
  }

  getIdempotentOrder(key: string): OrderReceipt | undefined {
    return this.idempotencyStore[key];
  }

  saveOrder(order: OrderReceipt, idempotencyKey?: string) {
    this.orders.unshift(order);
    if (idempotencyKey) {
      this.idempotencyStore[idempotencyKey] = order;
      this.save(STORAGE_KEYS.PROCESSED_IDEMPOTENCY, this.idempotencyStore);
    }
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    return order;
  }

  getOrderById(orderId: string): OrderReceipt | undefined {
    return this.orders.find((o) => o.orderId === orderId);
  }

  getUserOrders(userId: string): OrderReceipt[] {
    return this.orders.filter((o) => o.userId === userId);
  }

  clearUserCart(cartKey: string) {
    this.carts[cartKey] = { items: [] };
    this.save(STORAGE_KEYS.CARTS, this.carts);
  }
}

export const mockDb = new MockDatabase();
