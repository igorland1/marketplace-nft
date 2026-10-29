import { http, HttpResponse, delay } from 'msw';
import { mockDb } from '../data/db';

function getCartKey(request: Request): string {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    const parts = authHeader.replace('Bearer ', '').split('_');
    return `${parts[3]}_${parts[4]}`;
  }
  return 'guest';
}

export const cartHandlers = [
  // GET /api/cart - Obter carrinho do usuário ou visitante
  http.get('/api/cart', async ({ request }) => {
    await delay(120);
    const cartKey = getCartKey(request);
    const cart = mockDb.getCart(cartKey);
    return HttpResponse.json(cart);
  }),

  // POST /api/cart/items - Adicionar item ao carrinho
  http.post('/api/cart/items', async ({ request }) => {
    await delay(150);
    const cartKey = getCartKey(request);
    const body = (await request.json()) as {
      nftId: string;
      editionId: string;
      quantity: number;
    };

    if (!body.nftId || !body.editionId || !body.quantity) {
      return HttpResponse.json(
        { message: 'Parâmetros de item inválidos.' },
        { status: 400 }
      );
    }

    const nft = mockDb.getNFTById(body.nftId);
    if (!nft) {
      return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
    }

    const edition = nft.editions.find((e) => e.id === body.editionId);
    if (!edition || edition.status === 'sold_out' || edition.availableQuantity <= 0) {
      return HttpResponse.json(
        { message: 'Edição selecionada não está disponível para compra.' },
        { status: 409 }
      );
    }

    const cart = mockDb.addToCart(cartKey, {
      nftId: nft.id,
      editionId: edition.id,
      editionNumber: edition.editionNumber,
      name: nft.name,
      collection: nft.collection,
      imageUrl: nft.imageUrl,
      unitPriceEth: edition.priceEth,
      quantity: body.quantity,
      availableQuantity: edition.availableQuantity,
    });

    return HttpResponse.json(cart);
  }),

  // PATCH /api/cart/items - Atualizar quantidade
  http.patch('/api/cart/items', async ({ request }) => {
    await delay(120);
    const cartKey = getCartKey(request);
    const body = (await request.json()) as {
      nftId: string;
      editionId: string;
      quantity: number;
    };

    if (!body.nftId || !body.editionId || typeof body.quantity !== 'number') {
      return HttpResponse.json(
        { message: 'Parâmetros inválidos para atualização de quantidade.' },
        { status: 400 }
      );
    }

    const cart = mockDb.updateCartQuantity(
      cartKey,
      body.nftId,
      body.editionId,
      body.quantity
    );

    return HttpResponse.json(cart);
  }),

  // DELETE /api/cart/items/:nftId/:editionId - Remover item
  http.delete('/api/cart/items/:nftId/:editionId', async ({ params, request }) => {
    await delay(100);
    const cartKey = getCartKey(request);
    const { nftId, editionId } = params;

    const cart = mockDb.removeFromCart(
      cartKey,
      nftId as string,
      editionId as string
    );

    return HttpResponse.json(cart);
  }),

  // POST /api/cart/coupon - Aplicar cupom
  http.post('/api/cart/coupon', async ({ request }) => {
    await delay(150);
    const cartKey = getCartKey(request);
    const body = (await request.json()) as { code: string };

    if (!body.code) {
      return HttpResponse.json(
        { message: 'Código de cupom obrigatório.' },
        { status: 400 }
      );
    }

    const result = mockDb.applyCoupon(cartKey, body.code);
    if (!result.success) {
      return HttpResponse.json({ message: result.message }, { status: 400 });
    }

    return HttpResponse.json(result.cart);
  }),

  // DELETE /api/cart/coupon - Remover cupom
  http.delete('/api/cart/coupon', async ({ request }) => {
    await delay(100);
    const cartKey = getCartKey(request);
    const cart = mockDb.removeCoupon(cartKey);
    return HttpResponse.json(cart);
  }),
];
