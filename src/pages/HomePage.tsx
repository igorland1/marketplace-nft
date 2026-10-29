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
  'h-9 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const TABS: { label: string; sort: CatalogSearch['sort'] }[] = [
  { label: 'Todos os NFTs', sort: undefined },
  { label: 'Novos lançamentos', sort: 'recent' },
  { label: 'Em alta', sort: 'likes' },
];

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

  const grid = 'grid grid-cols-2 gap-4 lg:grid-cols-3';
  return (
    <div className="space-y-12">
      <section aria-labelledby="hero-title" className="grid items-center gap-6 py-4 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Bem-vindo à Kurio</p>
          <h1 id="hero-title" className="text-3xl font-bold uppercase leading-tight md:text-4xl">Seja dono do futuro da arte digital</h1>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <a href="#catalogo" className="inline-flex h-9 items-center rounded-md bg-primary px-6 text-xs font-bold uppercase text-primary-foreground hover:bg-primary/90">Explorar</a>
        </div>
        <img src="/nfts/art-1.webp" alt="Emerald Ape, arte em destaque" width={720} height={720} {...{ fetchpriority: "high" }} className="aspect-square w-full max-w-md justify-self-end rounded-lg object-cover" />
      </section>

      <section aria-labelledby="destaques">
        <h2 id="destaques" className="mb-4 border-b border-border pb-2 text-sm text-primary">Destaques</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {featured.isLoading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64" />)
            : featured.data?.data.map((n) => <NFTCard key={n.id} nft={n} />)}
        </div>
      </section>

      <div id="catalogo" className="grid scroll-mt-4 gap-6 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filtros" className="h-fit space-y-6 rounded-lg bg-card p-4 text-xs">
          <div>
            <h2 className="mb-3 text-sm">Coleções</h2>
            <ul className="space-y-1">
              <li><button type="button" aria-pressed={!search.collection} className={`w-full rounded px-2 py-1 text-left hover:text-primary ${!search.collection ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => update({ collection: undefined })}>Todas</button></li>
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <button type="button" aria-pressed={search.collection === c.slug} className={`w-full rounded px-2 py-1 text-left hover:text-primary ${search.collection === c.slug ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => update({ collection: c.slug })}>{c.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm">Faixa de preço</h2>
            <div className="flex gap-2">
              <Input aria-label="Preço mínimo (ETH)" placeholder="Min" inputMode="decimal" className="h-8 text-xs" value={search.min ?? ''} onChange={(e) => update({ min: dec(e.target.value) })} />
              <Input aria-label="Preço máximo (ETH)" placeholder="Max" inputMode="decimal" className="h-8 text-xs" value={search.max ?? ''} onChange={(e) => update({ max: dec(e.target.value) })} />
            </div>
            <label className="block pt-2">
              <span className="mb-1 block text-sm">Disponibilidade</span>
              <select aria-label="Disponibilidade" className={`${selectCls} w-full`} value={search.status ?? 'all'} onChange={(e) => update({ status: e.target.value as CatalogSearch['status'] })}>
                <option value="all">Todos</option>
                <option value="available">Disponíveis</option>
                <option value="sold_out">Esgotados</option>
              </select>
            </label>
          </div>
        </aside>

        <section aria-labelledby="catalogo-title" className="min-w-0 space-y-4">
          <h2 id="catalogo-title" className="sr-only">Catálogo</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input aria-label="Buscar NFTs" placeholder="Buscar por nome, coleção ou criador" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border">
            <div role="tablist" aria-label="Seções do catálogo" className="flex gap-4 text-xs">
              {TABS.map((t) => (
                <button key={t.label} role="tab" aria-selected={search.sort === t.sort} onClick={() => update({ sort: t.sort })}
                  className={`border-b-2 py-2 ${search.sort === t.sort ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 pb-1 text-xs text-muted-foreground">
              Ordenar por:
              <select aria-label="Ordenar por" className={selectCls} value={search.sort ?? 'recent'} onChange={(e) => update({ sort: e.target.value as CatalogSearch['sort'] })}>
                <option value="recent">Listados recentemente</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="likes">Mais curtidos</option>
              </select>
            </label>
          </div>

          {isError ? (
            <div role="alert" className="rounded-lg border border-destructive/40 p-6 text-center">
              <p className="mb-3">Não foi possível carregar o catálogo.</p>
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          ) : isLoading ? (
            <div className={grid}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-64" />)}</div>
          ) : data && data.data.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Nenhum NFT encontrado para esses filtros.
              <div className="mt-3"><Button variant="outline" onClick={() => { setQ(''); navigate({ search: {} }); }}>Limpar filtros</Button></div>
            </div>
          ) : (
            <>
              <div aria-busy={isFetching} className={`${grid} ${isFetching ? 'opacity-70' : ''}`}>
                {data?.data.map((n) => <NFTCard key={n.id} nft={n} />)}
              </div>
              {data && (
                <nav aria-label="Paginação" className="flex items-center justify-end gap-2 pt-4 text-xs">
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} aria-label={`Página ${p}`} aria-current={p === data.pagination.page ? 'page' : undefined}
                      onClick={() => navigate({ search: (prev) => ({ ...prev, page: p > 1 ? p : undefined }) })}
                      className={`h-7 w-7 rounded border ${p === data.pagination.page ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>{p}</button>
                  ))}
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
