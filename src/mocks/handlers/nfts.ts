import { http, HttpResponse, delay } from 'msw';
import { mockDb } from '../data/db';
import { PaginatedResponse, NFTItem } from '@/types';

function extractUserId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    const parts = authHeader.replace('Bearer ', '').split('_');
    return `${parts[3]}_${parts[4]}`;
  }
  return null;
}

export const nftHandlers = [
  // GET /api/nfts - Catálogo com filtros, busca, ordenação e paginação
  http.get('/api/nfts', async ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const collection = url.searchParams.get('collection');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const status = url.searchParams.get('status'); // 'all' | 'available' | 'sold_out'
    const sortBy = url.searchParams.get('sortBy'); // 'price_asc' | 'price_desc' | 'recent' | 'likes'
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '8', 10);

    // Latency simulation (configurable for chaos testing)
    const simulateLatency = url.searchParams.get('latency');
    if (simulateLatency) {
      await delay(parseInt(simulateLatency, 10));
    } else {
      await delay(250);
    }

    // Error simulation parameter
    if (url.searchParams.get('simulateError') === '500') {
      return HttpResponse.json({ message: 'Erro interno ao consultar catálogo.' }, { status: 500 });
    }

    const userId = extractUserId(request);
    const userFavorites = userId ? mockDb.getFavorites(userId) : [];

    let nfts = mockDb.getNFTs().map((nft) => ({
      ...nft,
      isLiked: userFavorites.includes(nft.id),
    }));

    // Filter by search keyword
    if (search) {
      nfts = nfts.filter(
        (nft) =>
          nft.name.toLowerCase().includes(search) ||
          nft.description.toLowerCase().includes(search) ||
          nft.collection.toLowerCase().includes(search) ||
          nft.creator.name.toLowerCase().includes(search)
      );
    }

    // Filter by collection slug
    if (collection && collection !== 'all') {
      nfts = nfts.filter((nft) => nft.collectionSlug === collection);
    }

    // Filter by min/max price
    if (minPrice) {
      const min = parseFloat(minPrice);
      nfts = nfts.filter((nft) => parseFloat(nft.priceEth) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      nfts = nfts.filter((nft) => parseFloat(nft.priceEth) <= max);
    }

    // Filter by edition status
    if (status && status !== 'all') {
      nfts = nfts.filter((nft) => {
        const hasAvailable = nft.editions.some((ed) => ed.availableQuantity > 0);
        return status === 'available' ? hasAvailable : !hasAvailable;
      });
    }

    // Sorting
    if (sortBy === 'price_asc') {
      nfts.sort((a, b) => parseFloat(a.priceEth) - parseFloat(b.priceEth));
    } else if (sortBy === 'price_desc') {
      nfts.sort((a, b) => parseFloat(b.priceEth) - parseFloat(a.priceEth));
    } else if (sortBy === 'likes') {
      nfts.sort((a, b) => b.likesCount - a.likesCount);
    } else {
      // 'recent' by default
      nfts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    const total = nfts.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = nfts.slice(startIndex, startIndex + limit);

    const responseData: PaginatedResponse<NFTItem> = {
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return HttpResponse.json(responseData);
  }),

  // GET /api/nfts/:id - Detalhes do NFT
  http.get('/api/nfts/:id', async ({ params, request }) => {
    await delay(180);
    const { id } = params;
    const nft = mockDb.getNFTById(id as string);

    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado no catálogo.' },
        { status: 404 }
      );
    }

    const userId = extractUserId(request);
    const isLiked = userId ? mockDb.getFavorites(userId).includes(nft.id) : false;

    return HttpResponse.json({
      ...nft,
      isLiked,
    });
  }),

  // POST /api/nfts/:id/favorite - Alternar favorito
  http.post('/api/nfts/:id/favorite', async ({ params, request }) => {
    await delay(100);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json(
        { message: 'Autenticação necessária para favoritar.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const isLiked = mockDb.toggleFavorite(userId, id as string);
    const updatedNFT = mockDb.getNFTById(id as string);

    return HttpResponse.json({
      nftId: id,
      isLiked,
      likesCount: updatedNFT?.likesCount ?? 0,
    });
  }),
];
