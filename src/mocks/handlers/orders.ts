import { http, HttpResponse, delay } from 'msw';
import { mockDb } from '../data/db';
import { OrderReceipt, OrderItem, NetworkType } from '@/types';
import { emitOrderUpdated, emitNFTUpdated } from '../socket';

function extractUserId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    const parts = authHeader.replace('Bearer ', '').split('_');
    return `${parts[3]}_${parts[4]}`;
  }
  return null;
}

export const orderHandlers = [
  // POST /api/checkout/quote - Cotação de taxas e validação de disponibilidade pré-pagamento
  http.post('/api/checkout/quote', async ({ request }) => {
    await delay(150);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const cart = mockDb.getCart(userId);
    if (cart.items.length === 0) {
      return HttpResponse.json({ message: 'O carrinho está vazio.' }, { status: 400 });
    }

    // Verify current availability & current price from live database
    const priceChangedItems: string[] = [];
    const unavailableItems: string[] = [];

    cart.items.forEach((item) => {
      const nft = mockDb.getNFTById(item.nftId);
      const edition = nft?.editions.find((e) => e.id === item.editionId);
      if (!edition || edition.availableQuantity < item.quantity) {
        unavailableItems.push(item.name);
      } else if (edition.priceEth !== item.unitPriceEth) {
        priceChangedItems.push(item.name);
      }
    });

    if (unavailableItems.length > 0) {
      return HttpResponse.json(
        {
          message: `Itens com quantidade indisponível: ${unavailableItems.join(', ')}`,
          code: 'ITEMS_UNAVAILABLE',
        },
        { status: 409 }
      );
    }

    if (priceChangedItems.length > 0) {
      return HttpResponse.json(
        {
          message: `Os preços foram alterados para: ${priceChangedItems.join(', ')}. Revise os valores antes de prosseguir.`,
          code: 'PRICE_CHANGED',
        },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      subtotalEth: cart.subtotalEth,
      discountEth: cart.discountEth,
      networkFeeEth: cart.networkFeeEth,
      totalEth: cart.totalEth,
      validUntil: new Date(Date.now() + 60000).toISOString(), // 60s validity
    });
  }),

  // POST /api/checkout/orders - Finalizar pedido com idempotência
  http.post('/api/checkout/orders', async ({ request }) => {
    await delay(400); // Simulate network transaction latency
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const cached = mockDb.getIdempotentOrder(idempotencyKey);
      if (cached) {
        // Return existing order without processing twice
        return HttpResponse.json(cached);
      }
    }

    const body = (await request.json()) as {
      walletId: string;
      network: NetworkType;
      simulateFailure?: boolean;
    };

    if (body.simulateFailure) {
      return HttpResponse.json(
        {
          message: 'Transação rejeitada pelo nó da rede blockchain.',
          code: 'TRANSACTION_REJECTED',
        },
        { status: 402 }
      );
    }

    const userWallets = mockDb.getUserWallets(userId);
    const selectedWallet = userWallets.find((w) => w.id === body.walletId);
    if (!selectedWallet) {
      return HttpResponse.json(
        { message: 'Carteira selecionada não encontrada ou não autorizada.' },
        { status: 404 }
      );
    }

    const cart = mockDb.getCart(userId);
    if (cart.items.length === 0) {
      return HttpResponse.json(
        { message: 'Carrinho vazio. Adicione itens antes de finalizar.' },
        { status: 400 }
      );
    }

    // Check if wallet balance is enough
    if (parseFloat(selectedWallet.balanceEth) < parseFloat(cart.totalEth)) {
      return HttpResponse.json(
        {
          message: `Saldo insuficiente na carteira (${selectedWallet.balanceEth} ETH disponível, necessário ${cart.totalEth} ETH).`,
          code: 'INSUFFICIENT_FUNDS',
        },
        { status: 400 }
      );
    }

    // Deduct edition stocks
    const orderItems: OrderItem[] = [];
    for (const item of cart.items) {
      const nft = mockDb.getNFTById(item.nftId);
      const edition = nft?.editions.find((e) => e.id === item.editionId);
      if (!edition || edition.availableQuantity < item.quantity) {
        return HttpResponse.json(
          {
            message: `Quantidade indisponível para o item: ${item.name}`,
            code: 'OUT_OF_STOCK',
          },
          { status: 409 }
        );
      }

      edition.availableQuantity -= item.quantity;
      if (edition.availableQuantity <= 0) {
        edition.status = 'sold_out';
      }

      orderItems.push({
        nftId: item.nftId,
        editionId: item.editionId,
        editionNumber: item.editionNumber,
        name: item.name,
        collection: item.collection,
        imageUrl: item.imageUrl,
        unitPriceEth: item.unitPriceEth,
        quantity: item.quantity,
        totalPriceEth: item.totalPriceEth,
      });

      // Emit real-time NFT stock update to any connected socket clients
      emitNFTUpdated({
        nftId: item.nftId,
        editionId: item.editionId,
        availableQuantity: edition.availableQuantity,
        status: edition.status,
      });
    }

    // Deduct balance from mock wallet
    selectedWallet.balanceEth = (
      Math.round(
        (parseFloat(selectedWallet.balanceEth) - parseFloat(cart.totalEth)) * 10000
      ) / 10000
    ).toFixed(4);
    mockDb.saveWallet(selectedWallet);

    const orderId = `ord_${Date.now()}`;
    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const receipt: OrderReceipt = {
      orderId,
      userId,
      walletAddress: selectedWallet.address,
      network: body.network || selectedWallet.network,
      transactionHash: txHash,
      explorerUrl: `https://etherscan.io/tx/${txHash}`,
      items: orderItems,
      subtotalEth: cart.subtotalEth,
      discountEth: cart.discountEth,
      networkFeeEth: cart.networkFeeEth,
      totalEth: cart.totalEth,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      idempotencyKey: idempotencyKey || undefined,
    };

    mockDb.saveOrder(receipt, idempotencyKey || undefined);

    // Empty cart only after successful order confirmation
    mockDb.clearUserCart(userId);

    // Broadcast order confirmation event
    emitOrderUpdated({
      orderId: receipt.orderId,
      status: 'confirmed',
      transactionHash: receipt.transactionHash,
    });

    return HttpResponse.json(receipt, { status: 201 });
  }),

  // GET /api/orders - Histórico de pedidos do colecionador
  http.get('/api/orders', async ({ request }) => {
    await delay(150);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }
    const orders = mockDb.getUserOrders(userId);
    return HttpResponse.json(orders);
  }),

  // GET /api/orders/:id - Detalhes e recibo imutável
  http.get('/api/orders/:id', async ({ params, request }) => {
    await delay(120);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const { id } = params;
    const order = mockDb.getOrderById(id as string);

    if (!order) {
      return HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    if (order.userId !== userId) {
      return HttpResponse.json(
        { message: 'Acesso não autorizado a este recibo.' },
        { status: 403 }
      );
    }

    return HttpResponse.json(order);
  }),
];
