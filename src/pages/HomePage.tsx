import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useNFTs } from '@/hooks/useNFTs';
import { NFTCard } from '@/components/NFTCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NFTFilterParams } from '@/types';

export interface CatalogSearch {
  q?: string;
  collection?: string;
  network?: string;
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
    network: str(s.network),
    status: ['all', 'available', 'sold_out'].includes(s.status as string) ? (s.status as CatalogSearch['status']) : undefined,
    sort: ['price_asc', 'price_desc', 'recent', 'likes'].includes(s.sort as string) ? (s.sort as CatalogSearch['sort']) : undefined,
    min: dec(s.min),
    max: dec(s.max),
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  };
}

const COLLECTIONS = [
  { slug: 'digital_art', label: 'Arte digital', count: 33 },
  { slug: 'photography', label: 'Fotografia', count: 12 },
  { slug: 'music', label: 'Música', count: 65 },
  { slug: '3d_art', label: 'Arte 3D', count: 39 },
  { slug: 'collectibles', label: 'Colecionáveis', count: 23 },
  { slug: 'generative', label: 'Generativa', count: 17 },
  { slug: 'gaming', label: 'Jogos', count: 19 },
  { slug: 'memberships', label: 'Assinaturas', count: 13 },
  { slug: 'utility', label: 'Utilidade', count: 18 },
];

const NETWORKS = [
  { slug: 'ethereum', label: 'Ethereum', count: 119 },
  { slug: 'polygon', label: 'Polygon', count: 78 },
  { slug: 'solana', label: 'Solana', count: 86 },
];

const ARTICLES = [
  {
    image: '/figma/article-ownership.jpg',
    date: '12 de setembro',
    readTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    image: '/figma/article-artists.jpg',
    date: '13 de setembro',
    readTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    image: '/figma/article-rarity.jpg',
    date: '15 de setembro',
    readTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    image: '/figma/article-wallet.jpg',
    date: '15 de setembro',
    readTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
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

  const [localMin, setLocalMin] = useState<string | null>(null);
  const [localMax, setLocalMax] = useState<string | null>(null);

  const minInput = localMin !== null ? localMin : (search.min ?? '');
  const maxInput = localMax !== null ? localMax : (search.max ?? '');

  const update = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) });

  const handleApplyPrice = () => {
    update({ min: dec(minInput), max: dec(maxInput) });
    setLocalMin(null);
    setLocalMax(null);
  };

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

  const grid = 'grid grid-cols-2 gap-4 lg:grid-cols-3';

  return (
    <div className="space-y-16">
      {/* Hero Section (Figma Desktop: Início) */}
      <section aria-labelledby="hero-title" className="grid items-center gap-8 py-6 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Bem-vindo à Kurio</p>
          <h1 id="hero-title" className="text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
            Seja dono do futuro<br />da arte digital
          </h1>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <div className="pt-2">
            <a
              href="#catalogo"
              className="inline-flex h-9 items-center rounded-md bg-primary px-7 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Explorar
            </a>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <img
            src="/figma/hero-ape.jpg"
            alt="Emerald Ape, arte em destaque"
            width={720}
            height={720}
            {...{ fetchpriority: 'high' }}
            className="aspect-square w-full max-w-md rounded-xl object-cover shadow-2xl"
          />
          {/* Carousel dots from Figma */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-2 w-6 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-muted transition-colors" />
            <span className="h-2 w-2 rounded-full bg-muted transition-colors" />
            <span className="h-2 w-2 rounded-full bg-muted transition-colors" />
          </div>
        </div>
      </section>

      {/* Catalog & Filters Section (Figma) */}
      <div id="catalogo" className="grid scroll-mt-6 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Left Sidebar Filters */}
        <aside aria-label="Filtros" className="h-fit space-y-6 rounded-xl border border-border bg-card p-5 text-xs">
          {/* Coleções */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Coleções</h2>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  aria-pressed={!search.collection}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition hover:text-primary ${!search.collection ? 'font-medium text-primary' : 'text-muted-foreground'}`}
                  onClick={() => update({ collection: undefined })}
                >
                  <span>Todas</span>
                </button>
              </li>
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    aria-pressed={search.collection === c.slug}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition hover:text-primary ${search.collection === c.slug ? 'font-medium text-primary' : 'text-muted-foreground'}`}
                    onClick={() => update({ collection: c.slug })}
                  >
                    <span>{c.label}</span>
                    <span className="text-[11px] text-muted-foreground/80">({c.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Faixa de Preço */}
          <div className="space-y-2.5 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Faixa de preço</h2>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Preço: {search.min ?? '0,02'} - {search.max ?? '12,30'} ETH
            </p>
            <div className="flex gap-2">
              <Input
                aria-label="Preço mínimo (ETH)"
                placeholder="Min"
                inputMode="decimal"
                className="h-8 text-xs"
                value={minInput}
                onChange={(e) => setLocalMin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyPrice();
                }}
              />
              <Input
                aria-label="Preço máximo (ETH)"
                placeholder="Max"
                inputMode="decimal"
                className="h-8 text-xs"
                value={maxInput}
                onChange={(e) => setLocalMax(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyPrice();
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyPrice}
              className="w-full text-xs"
            >
              Aplicar
            </Button>
          </div>

          {/* Rede */}
          <div className="space-y-2 border-t border-border pt-5">
            <h2 className="text-sm font-semibold text-foreground">Rede</h2>
            <ul className="space-y-1">
              {NETWORKS.map((n) => (
                <li key={n.slug}>
                  <button
                    type="button"
                    aria-pressed={search.network === n.slug}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition hover:text-primary ${search.network === n.slug ? 'font-medium text-primary' : 'text-muted-foreground'}`}
                    onClick={() => update({ network: search.network === n.slug ? undefined : n.slug })}
                  >
                    <span>{n.label}</span>
                    <span className="text-[11px] text-muted-foreground/80">({n.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar Promotional Featured Card (Figma) */}
          <div className="relative overflow-hidden rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 pt-4">
            <div className="mb-2 flex flex-col gap-1">
              <span className="inline-block w-fit rounded-sm bg-purple-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">
                NFT em destaque
              </span>
              <span className="inline-block w-fit rounded-sm bg-amber-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">
                Oferta limitada
              </span>
            </div>
            <img
              src="/figma/sidebar-featured.jpg"
              alt="NFT em destaque na barra lateral"
              width={240}
              height={240}
              className="mt-2 aspect-square w-full rounded-md object-cover"
            />
          </div>
        </aside>

        {/* Right Catalog Main Section */}
        <section aria-labelledby="catalogo-title" className="min-w-0 space-y-4">
          <h2 id="catalogo-title" className="sr-only">Catálogo</h2>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1">
            <div role="tablist" aria-label="Seções do catálogo" className="flex gap-4 text-xs">
              {TABS.map((t) => (
                <button
                  key={t.label}
                  role="tab"
                  aria-selected={search.sort === t.sort}
                  onClick={() => update({ sort: t.sort })}
                  className={`border-b-2 py-2 font-medium transition-colors ${search.sort === t.sort ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Ordenar por:
              <select
                aria-label="Ordenar por"
                className={selectCls}
                value={search.sort ?? 'recent'}
                onChange={(e) => update({ sort: e.target.value as CatalogSearch['sort'] })}
              >
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
            <div className={grid}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Nenhum NFT encontrado para esses filtros.
              <div className="mt-3">
                <Button variant="outline" onClick={() => navigate({ search: {} })}>
                  Limpar filtros
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div aria-busy={isFetching} className={`${grid} ${isFetching ? 'opacity-70' : ''}`}>
                {data?.data.map((n) => (
                  <NFTCard key={n.id} nft={n} />
                ))}
              </div>
              {data && (
                <nav aria-label="Paginação" className="flex items-center justify-end gap-2 pt-4 text-xs">
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      aria-label={`Página ${p}`}
                      aria-current={p === data.pagination.page ? 'page' : undefined}
                      onClick={() => navigate({ search: (prev) => ({ ...prev, page: p > 1 ? p : undefined }) })}
                      className={`h-7 w-7 rounded border font-mono text-xs transition ${p === data.pagination.page ? 'border-primary bg-primary text-primary-foreground font-bold' : 'border-border hover:border-primary'}`}
                    >
                      {p}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {/* Promotional Banners Section (Figma) */}
      <section aria-label="Banners Promocionais" className="grid gap-6 md:grid-cols-2">
        {/* Banner 1 */}
        <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 md:flex-row md:items-center gap-6">
          <div className="space-y-3 max-w-sm">
            <h3 className="text-lg font-bold leading-snug text-foreground">
              Lançamentos gênesis<br />de edição limitada
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Colecione edições escassas diretamente dos criadores antes da revelação pública.
            </p>
            <a
              href="#catalogo"
              className="inline-flex h-8 items-center rounded-md border border-primary bg-primary/10 px-4 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Explorar
            </a>
          </div>
          <img
            src="/figma/promo-genesis.jpg"
            alt="Lançamentos gênesis"
            width={240}
            height={240}
            className="h-44 w-44 rounded-lg object-cover self-center shrink-0 shadow-md"
          />
        </div>

        {/* Banner 2 */}
        <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 md:flex-row md:items-center gap-6">
          <div className="space-y-3 max-w-sm">
            <h3 className="text-lg font-bold leading-snug text-foreground">
              Arte digital selecionada<br />e muito mais
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
            </p>
            <a
              href="#catalogo"
              className="inline-flex h-8 items-center rounded-md border border-primary bg-primary/10 px-4 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Explorar
            </a>
          </div>
          <img
            src="/figma/promo-curated.jpg"
            alt="Arte digital selecionada"
            width={240}
            height={240}
            className="h-44 w-44 rounded-lg object-cover self-center shrink-0 shadow-md"
          />
        </div>
      </section>

      {/* Minting Diary / Blog Section (Figma: Diário da Cunhagem) */}
      <section aria-labelledby="diario-title" className="space-y-8 pt-4">
        <div className="space-y-2 text-center">
          <h2 id="diario-title" className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Diário da Cunhagem
          </h2>
          <p className="mx-auto max-w-xl text-xs text-muted-foreground">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ARTICLES.map((article) => (
            <article
              key={article.title}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
            >
              <div className="space-y-3">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-background">
                  <img
                    src={article.image}
                    alt={article.title}
                    width={360}
                    height={270}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center text-[11px] text-muted-foreground">
                  <span>{article.date}</span>
                  <span className="mx-2">|</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="#diario-title"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ler mais <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
