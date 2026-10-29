import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useNFTs } from '@/hooks/useNFTs';
import { NFTCard } from '@/components/NFTCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NFTFilterParams } from '@/types';

export interface CatalogSearch {
  q?: string;
  collection?: string;
  status?: 'all' | 'available' | 'sold_out';
  sort?: 'price_asc' | 'price_desc' | 'recent' | 'likes';
  min?: string;
  max?: string;
  page?: number;
}

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const dec = (v: unknown) => (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v) ? v : undefined);

export function validateCatalogSearch(s: Record<string, unknown>): CatalogSearch {
  const page = Number(s.page);
  return {
    q: str(s.q),
    collection: str(s.collection),
    status: ['all', 'available', 'sold_out'].includes(s.status as string) ? (s.status as CatalogSearch['status']) : undefined,
    sort: ['price_asc', 'price_desc', 'recent', 'likes'].includes(s.sort as string) ? (s.sort as CatalogSearch['sort']) : undefined,
    min: dec(s.min),
    max: dec(s.max),
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  };
}

const COLLECTIONS = [
  { slug: 'neo-tokyo-legends', label: 'Neo Tokyo Legends' },
  { slug: 'algorithmic-wonders', label: 'Algorithmic Wonders' },
  { slug: 'astral-odyssey', label: 'Astral Odyssey' },
];

const selectCls =
  'h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function HomePage() {
  const search = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });
  const [q, setQ] = useState(search.q ?? '');

  const update = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) });

  // Debounced search -> URL (resets pagination)
  useEffect(() => {
    if ((search.q ?? '') === q) return;
    const t = setTimeout(() => update({ q: q || undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const params: NFTFilterParams = {
    search: search.q,
    collection: search.collection,
    status: search.status,
    sortBy: search.sort,
    minPrice: search.min,
    maxPrice: search.max,
    page: search.page ?? 1,
    limit: 6,
  };
  const { data, isLoading, isError, isFetching, refetch } = useNFTs(params);
  const featured = useNFTs({ sortBy: 'likes', limit: 3 });

  return (
    <div className="space-y-10">
      <section aria-labelledby="destaques">
        <h2 id="destaques" className="mb-4 text-2xl font-bold">Destaques</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.isLoading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-72" />)
            : featured.data?.data.map((n) => <NFTCard key={n.id} nft={n} />)}
        </div>
      </section>

      <section aria-labelledby="catalogo" className="space-y-4">
        <h2 id="catalogo" className="text-2xl font-bold">Catálogo</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              aria-label="Buscar NFTs"
              placeholder="Buscar por nome, coleção ou criador"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select aria-label="Coleção" className={selectCls} value={search.collection ?? ''} onChange={(e) => update({ collection: e.target.value || undefined })}>
            <option value="">Todas as coleções</option>
            {COLLECTIONS.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          <select aria-label="Disponibilidade" className={selectCls} value={search.status ?? 'all'} onChange={(e) => update({ status: e.target.value as CatalogSearch['status'] })}>
            <option value="all">Todos</option>
            <option value="available">Disponíveis</option>
            <option value="sold_out">Esgotados</option>
          </select>
          <select aria-label="Ordenar por" className={selectCls} value={search.sort ?? 'recent'} onChange={(e) => update({ sort: e.target.value as CatalogSearch['sort'] })}>
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="likes">Mais curtidos</option>
          </select>
          <Input aria-label="Preço mínimo (ETH)" placeholder="Min ETH" inputMode="decimal" className="w-28" value={search.min ?? ''} onChange={(e) => update({ min: dec(e.target.value) })} />
          <Input aria-label="Preço máximo (ETH)" placeholder="Max ETH" inputMode="decimal" className="w-28" value={search.max ?? ''} onChange={(e) => update({ max: dec(e.target.value) })} />
        </div>

        {isError ? (
          <div role="alert" className="rounded-lg border border-red-500/30 p-6 text-center">
            <p className="mb-3">Não foi possível carregar o catálogo.</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Nenhum NFT encontrado para esses filtros.
            <div className="mt-3">
              <Button variant="outline" onClick={() => { setQ(''); navigate({ search: {} }); }}>Limpar filtros</Button>
            </div>
          </div>
        ) : (
          <>
            <div aria-busy={isFetching} className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-70' : ''}`}>
              {data?.data.map((n) => <NFTCard key={n.id} nft={n} />)}
            </div>
            {data && (
              <nav aria-label="Paginação" className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={data.pagination.page <= 1}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: data.pagination.page - 1 || undefined }) })}>Anterior</Button>
                <span className="text-sm">Página {data.pagination.page} de {data.pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: data.pagination.page + 1 }) })}>Próxima</Button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
