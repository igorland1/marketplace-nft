import { useState } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { Check, Copy, Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import axios from 'axios';
import { useNFTDetail, useNFTs, useToggleFavorite } from '@/hooks/useNFTs';
import { useAddToCart, useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NFTCard } from '@/components/NFTCard';
import { errorMessage } from '@/lib/format';

const REVIEWS = [
  {
    author: 'Alexandre Costa',
    badge: 'Colecionador verificado',
    date: 'Há 2 semanas',
    rating: 5,
    comment:
      'Arte impressionante com acabamento impecável. A procedência na rede Ethereum dá total segurança e o suporte da comunidade é incrível.',
  },
  {
    author: 'Mariana Silva',
    badge: 'Colecionador verificado',
    date: 'Há 1 mês',
    rating: 5,
    comment:
      'Uma das peças mais marcantes da coleção Kurio Editions. O processo de compra foi suave e o recibo de autenticidade foi gerado instantaneamente.',
  },
  {
    author: 'CryptoArt_BR',
    badge: 'Curador independente',
    date: 'Há 1 mês',
    rating: 5,
    comment:
      'Excelente procedência, contrato inteligente ERC-721 transparente e metadados no IPFS. Recomendo para qualquer colecionador sério.',
  },
];

export function NFTDetailPage() {
  const isMobile = useIsMobile();
  const { id } = useParams({ from: '/nft/$id' });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: nft, isLoading, error } = useNFTDetail(id);
  const { data: cart } = useCart();
  const { data: moreNfts } = useNFTs({ limit: 6 });
  const fav = useToggleFavorite();
  const add = useAddToCart();

  const [selectedThumb, setSelectedThumb] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [copiedLink, setCopiedLink] = useState(false);
  const [editionId, setEditionId] = useState<string>();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="grid gap-8 lg:grid-cols-[100px_480px_1fr]" aria-busy="true" aria-label="Carregando detalhes do NFT">
          <div className="hidden space-y-3 lg:block">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-md" />
            ))}
          </div>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-foreground">NFT não encontrado</h1>
        <p className="text-xs text-muted-foreground">O item solicitado não existe ou foi removido do catálogo.</p>
        <div>
          <Link to="/" className={buttonVariants()}>
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div role="alert" className="p-8 text-center text-sm text-destructive">
        Não foi possível carregar o NFT.
      </div>
    );
  }

  const edition =
    nft.editions.find(
      (e) => e.id === (editionId ?? nft.editions.find((x) => x.availableQuantity > 0)?.id ?? nft.editions[0].id),
    ) ?? nft.editions[0];

  const inCart = cart?.items.find((i) => i.editionId === edition.id)?.quantity ?? 0;
  const maxQty = Math.max(0, Math.min(edition.maxQuantityPerUser, edition.availableQuantity) - inCart);
  const unavailable = edition.availableQuantity <= 0 || edition.status === 'sold_out';
  const safeQty = Math.min(Math.max(1, qty), Math.max(1, maxQty));

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddToCart = () => {
    add.mutate(
      { nftId: nft.id, editionId: edition.id, quantity: safeQty },
      {
        onSuccess: () => {
          setMsg({ ok: true, text: 'Adicionado ao carrinho.' });
          setQty(1);
        },
        onError: (e) => setMsg({ ok: false, text: errorMessage(e) }),
      },
    );
  };

  const handleToggleFavorite = () => {
    if (isAuthenticated) {
      fav.mutate(nft.id);
    } else {
      navigate({ to: '/login', search: { redirect: `/nft/${nft.id}` } });
    }
  };

  const relatedNFTs = moreNfts?.data.filter((n) => n.id !== nft.id).slice(0, 5) ?? [];

  if (isMobile) {
    return (
      <div className="-mx-4 -mt-3 -mb-24 flex min-h-screen flex-col bg-[#140D0A] font-mono text-[#F5F1EB]">
        {/* Top Section (Header buttons + Artwork image) with top gradient */}
        <div
          className="relative px-5 pt-3 pb-8"
          style={{
            background: 'linear-gradient(135deg, #241612 0%, #2F1D15 100%)',
          }}
        >
          {/* Mobile Top Bar (Back button + Favorite button) */}
          <div className="flex items-center justify-between pb-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: '/' });
                }
              }}
              aria-label="Voltar"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#2F1D15] border border-[#3F2319] text-[#CFB28C] hover:text-white transition-colors active:scale-95 shadow-sm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Favoritar"
              aria-pressed={!!nft.isLiked}
              onClick={handleToggleFavorite}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#2F1D15] border border-[#3F2319] text-[#CFB28C] hover:text-[#D28A4C] transition-colors active:scale-95 shadow-sm"
            >
              <Heart
                className={`h-4 w-4 ${nft.isLiked ? 'fill-[#D28A4C] text-[#D28A4C]' : ''}`}
                aria-hidden
              />
              <span className="sr-only">{nft.likesCount}</span>
            </button>
          </div>

          {/* Main Artwork Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-[#1e1512] shadow-xl mt-2">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              width={600}
              height={600}
              {...{ fetchpriority: 'high' }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Middle Content Section (Card with rounded top corners) */}
        <div className="relative -mt-4 rounded-t-[32px] bg-[#241612] px-6 pt-6 pb-6 space-y-4 shadow-md flex-1">
          {/* Title & Rating Badge */}
          <div className="flex items-center justify-between gap-3">
            <h1 id="nft-title" className="text-xl font-bold font-mono text-[#F5F1EB] tracking-tight">
              {nft.name}
            </h1>

            <div className="flex items-center gap-1 rounded-full border border-[#D28A4C] px-2.5 py-0.5 text-xs font-mono">
              <Star className="h-3 w-3 fill-[#D28A4C] text-[#D28A4C]" aria-hidden />
              <span className="font-bold text-[#F5F1EB]">4.8</span>
              <span className="text-[#CFB28C]">(19)</span>
            </div>
          </div>

          {/* Description Paragraph */}
          <p className="text-xs leading-relaxed text-[#CFB28C] font-mono">
            {nft.description ||
              `Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.`}
          </p>

          {/* Edition Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold font-mono text-[#F5F1EB] block">
              Edição:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {nft.editions.map((e) => {
                const isSelected = e.id === edition.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setEditionId(e.id);
                      setQty(1);
                      setMsg(undefined);
                    }}
                    className={`rounded-full px-3 py-1 font-mono text-xs transition ${
                      isSelected
                        ? 'border-2 border-[#D28A4C] bg-transparent text-[#D28A4C] font-bold shadow-sm'
                        : 'border border-[#3F2319] bg-transparent text-[#CFB28C] hover:border-[#D28A4C]/50'
                    }`}
                  >
                    {e.editionNumber}/{e.totalEditions}
                  </button>
                );
              })}
              <span className="inline-flex items-center rounded-full border border-[#3F2319] bg-transparent px-3 py-1 font-mono text-xs text-[#CFB28C]">
                ABERTA
              </span>
            </div>
          </div>

          {/* Metadata List */}
          <div className="space-y-2.5 pt-2 font-mono text-xs">
            <div>
              <span className="text-[#CFB28C]">ID do token: </span>
              <span className="text-[#F5F1EB]">{nft.tokenId}</span>
            </div>
            <div>
              <span className="text-[#CFB28C]">Coleção: </span>
              <span className="text-[#F5F1EB]">{nft.collection}</span>
            </div>
            <div>
              <span className="text-[#CFB28C]">Atributos: </span>
              <span className="text-[#F5F1EB]">
                {nft.attributes.map((a) => a.value).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Purchase Block (Full-width elevated bottom section) */}
        <div className="mt-auto rounded-t-[40px] bg-[#241612] px-6 pt-5 pb-8 space-y-4 shadow-[0_-12px_28px_rgba(10,6,4,0.45)] border-0">
          {/* Quantity & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#CFB28C]">Qtd.</span>
              <div className="flex items-center gap-2 font-mono">
                <button
                  type="button"
                  aria-label="Diminuir"
                  disabled={safeQty <= 1}
                  onClick={() => setQty(safeQty - 1)}
                  className="flex h-[30px] w-5 items-center justify-center rounded-[10px] bg-[#D28A4C] text-[#140D0A] font-bold text-sm disabled:opacity-40 active:scale-95 transition"
                >
                  −
                </button>
                <span className="min-w-4 text-center font-bold text-[#F5F1EB] text-sm" aria-live="polite">
                  {safeQty}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar"
                  disabled={safeQty >= maxQty}
                  onClick={() => setQty(safeQty + 1)}
                  className="flex h-[30px] w-5 items-center justify-center rounded-[10px] bg-[#D28A4C] text-[#140D0A] font-bold text-sm disabled:opacity-40 active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-lg font-bold text-[#D28A4C]">
                {edition.priceEth} ETH
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={unavailable || maxQty <= 0 || add.isPending}
              onClick={() => {
                handleAddToCart();
                navigate({ to: '/checkout' });
              }}
              className="flex-1 h-[56px] rounded-full bg-gradient-to-r from-[#D28A4C] to-[#D28A4C]/85 text-[#140D0A] font-bold font-mono text-base hover:brightness-105 active:scale-98 transition shadow-md border-0"
            >
              Comprar NFT
            </Button>

            <button
              type="button"
              aria-label="Adicionar ao carrinho"
              disabled={unavailable || maxQty <= 0 || add.isPending}
              onClick={handleAddToCart}
              className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#2F1D15] border border-[#3F2319] text-[#CFB28C] hover:text-[#D28A4C] hover:border-[#D28A4C]/50 transition active:scale-95 disabled:opacity-40 shadow-sm"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Adicionar ao carrinho</span>
            </button>
          </div>

          {msg && (
            <p role="status" className={`text-xs font-mono font-medium ${msg.ok ? 'text-primary' : 'text-destructive'}`}>
              {msg.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Breadcrumb Navigation (Figma: Início / Mercado) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">
          Início
        </Link>
        <span aria-hidden>/</span>
        <Link to="/" hash="catalogo" className="hover:text-primary transition-colors">
          Mercado
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium truncate max-w-[240px]">{nft.name}</span>
      </nav>

      {/* Main Detail Header Grid (Gallery Thumbnails + Main View + Buy Panel) */}
      <section aria-labelledby="nft-title" className="grid gap-8 lg:grid-cols-[88px_460px_1fr]">
        {/* Left Vertical Gallery Thumbnails (Figma) */}
        <div className="hidden flex-col gap-3 lg:flex">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Ver imagem ${idx + 1}`}
              onClick={() => setSelectedThumb(idx)}
              className={`aspect-square w-full overflow-hidden rounded-lg border-2 transition ${
                selectedThumb === idx ? 'border-primary shadow-md' : 'border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={nft.imageUrl}
                alt={`${nft.name} miniatura ${idx + 1}`}
                width={88}
                height={88}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Artwork Display */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              width={600}
              height={600}
              {...{ fetchpriority: 'high' }}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Mobile Thumbnail Strip */}
          <div className="flex gap-2 lg:hidden">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Ver miniatura ${idx + 1}`}
                onClick={() => setSelectedThumb(idx)}
                className={`h-14 w-14 overflow-hidden rounded-md border-2 transition ${
                  selectedThumb === idx ? 'border-primary' : 'border-border opacity-70'
                }`}
              >
                <img src={nft.imageUrl} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Info & Purchase Panel (Figma) */}
        <div className="space-y-5">
          {/* Title & Creator */}
          <div>
            <h1 id="nft-title" className="text-3xl font-extrabold uppercase tracking-tight text-foreground md:text-4xl">
              {nft.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <img src={nft.creator.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              <span>Por <span className="font-semibold text-foreground">{nft.creator.name}</span></span>
              {nft.creator.verified && <Badge tone="success">Verificado</Badge>}
            </div>
          </div>

          {/* Price & Collector Reviews Rating */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <p className="text-3xl font-extrabold font-mono text-primary">
                {edition.priceEth} ETH
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div role="img" aria-label="Avaliação: 5 de 5 estrelas" className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="hover:text-foreground transition-colors underline decoration-dotted"
              >
                19 avaliações de colecionadores
              </button>
            </div>
          </div>

          {/* Sobre este NFT */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sobre este NFT:
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {nft.description ||
                'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.'}
            </p>
          </div>

          {/* Edição selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Edição:
            </label>
            <div className="flex flex-wrap gap-2">
              {nft.editions.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  aria-pressed={e.id === edition.id}
                  onClick={() => {
                    setEditionId(e.id);
                    setQty(1);
                    setMsg(undefined);
                  }}
                  className={`rounded-md border px-3 py-1.5 font-mono text-xs transition ${
                    e.id === edition.id
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  #{e.editionNumber}/{e.totalEditions}
                  {e.availableQuantity <= 0 && <span className="ml-1.5 text-destructive font-normal">(Esgotada)</span>}
                </button>
              ))}
              <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                ABERTA
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {unavailable
                ? 'Edição esgotada ou indisponível.'
                : `${edition.availableQuantity} disponíveis · limite de ${edition.maxQuantityPerUser} por carteira`}
            </p>
          </div>

          {/* Quantity Stepper & Actions (COMPRAR / Adicionar ao carrinho & Favoritar) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex h-10 items-center rounded-md border border-border bg-card" role="group" aria-label="Quantidade">
              <button
                type="button"
                aria-label="Diminuir"
                disabled={safeQty <= 1}
                onClick={() => setQty(safeQty - 1)}
                className="flex h-full w-8 items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center font-mono text-xs font-bold" aria-live="polite">
                {safeQty}
              </span>
              <button
                type="button"
                aria-label="Aumentar"
                disabled={safeQty >= maxQty}
                onClick={() => setQty(safeQty + 1)}
                className="flex h-full w-8 items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                +
              </button>
            </div>

            {/* Primary Action Button (satisfies both COMPRAR and Adicionar ao carrinho selectors) */}
            <Button
              size="lg"
              className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90"
              disabled={unavailable || maxQty <= 0 || add.isPending}
              onClick={handleAddToCart}
            >
              {maxQty <= 0 && !unavailable
                ? 'Limite atingido'
                : 'COMPRAR (Adicionar ao carrinho)'}
            </Button>

            {/* Favorite Button */}
            <Button
              variant="outline"
              aria-pressed={!!nft.isLiked}
              onClick={handleToggleFavorite}
              className="h-10 px-4 text-xs font-semibold gap-1.5"
            >
              <Heart
                className={`h-4 w-4 ${nft.isLiked ? 'fill-destructive text-destructive' : ''}`}
                aria-hidden
              />
              <span>Favoritar</span>
              <span className="text-muted-foreground font-mono text-[11px]">({nft.likesCount})</span>
            </Button>
          </div>

          {msg && (
            <p role="status" className={`text-xs font-medium ${msg.ok ? 'text-primary' : 'text-destructive'}`}>
              {msg.text}
            </p>
          )}

          {/* Quick Details & Sharing (Figma) */}
          <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">ID do token: </span>
              <span className="font-mono text-foreground">{nft.tokenId}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Coleção: </span>
              <span className="text-foreground">{nft.collection}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Atributos: </span>
              <span className="text-foreground">
                {nft.attributes.map((a) => a.value).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="font-semibold text-foreground">Compartilhar este NFT:</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copiar link"
                  title="Copiar link"
                  className="flex h-7 w-7 items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira ${nft.name} na Kurio!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no X"
                  className="flex h-7 w-7 items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section (Detalhes do NFT / Avaliações de colecionadores) */}
      <section aria-label="Informações detalhadas" className="space-y-6 border-t border-border pt-8">
        <div role="tablist" aria-label="Abas de detalhes" className="flex gap-8 border-b border-border text-xs">
          <button
            role="tab"
            aria-selected={activeTab === 'details'}
            onClick={() => setActiveTab('details')}
            className={`border-b-2 pb-3 font-semibold transition-colors ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Detalhes do NFT
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
            className={`border-b-2 pb-3 font-semibold transition-colors ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Avaliações de colecionadores (19)
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Descriptive paragraphs from Figma */}
            <div className="space-y-4 max-w-4xl text-xs leading-relaxed text-muted-foreground">
              <p>
                {nft.name} é uma obra digital {edition.editionNumber}/{edition.totalEditions} finalizada à mão da coleção {nft.collection}. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
              </p>
              <p>
                A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. {nft.creator.name} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.
              </p>
            </div>

            {/* Technical Detail Blocks (Figma) */}
            <div className="grid gap-6 md:grid-cols-3 pt-2">
              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Rede:</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Contrato:</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                  0x7A42...19E8 • Contrato inteligente ERC-721 verificado.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Direitos autorais:</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.
                </p>
              </div>
            </div>

            {/* Traits & Attributes */}
            <div className="pt-2">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
                Atributos e Raridade
              </h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {nft.attributes.map((a) => (
                  <li key={a.traitType} className="rounded-lg border border-border bg-card p-3 text-xs space-y-1">
                    <span className="block text-[11px] text-muted-foreground">{a.traitType}</span>
                    <span className="font-semibold text-foreground block truncate">{a.value}</span>
                    {a.rarityPercentage && (
                      <span className="text-[10px] text-primary block">{a.rarityPercentage}% raridade</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid gap-4 md:grid-cols-3">
              {REVIEWS.map((rev) => (
                <div key={rev.author} className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{rev.author}</h4>
                      <span className="text-[10px] text-primary">{rev.badge}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <div role="img" aria-label={`${rev.rating} de 5 estrelas`} className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section "Mais desta coleção" (Figma) */}
      <section aria-labelledby="mais-colecao-title" className="space-y-6 border-t border-border pt-12">
        <h2 id="mais-colecao-title" className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Mais desta coleção
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {relatedNFTs.map((item) => (
            <NFTCard key={item.id} nft={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
