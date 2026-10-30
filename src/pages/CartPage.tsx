import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useApplyCoupon, useCart, useRemoveCoupon, useRemoveFromCart, useUpdateCartQuantity } from '@/hooks/useCart';
import { useNFTs } from '@/hooks/useNFTs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { NFTCard } from '@/components/NFTCard';
import { errorMessage } from '@/lib/format';

export function CartPage() {
  const isMobile = useIsMobile();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const { data: recData } = useNFTs({ limit: 5 });
  const update = useUpdateCartQuantity();
  const remove = useRemoveFromCart();
  const apply = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState<string>();
  const navigate = useNavigate();

  const recommendations = recData?.data ?? [];

  if (isLoading) {
    if (isMobile) {
      return (
        <div className="space-y-4 pt-2" aria-busy="true" aria-label="Carregando carrinho">
          <Skeleton className="h-10 w-48 rounded-full" />
          <Skeleton className="h-28 rounded-[24px]" />
          <Skeleton className="h-28 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      );
    }
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Carregando carrinho">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !cart) {
    return (
      <div role="alert" className="py-16 text-center space-y-4">
        <p className="text-sm text-destructive">Falha ao carregar o carrinho.</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  /* Empty Cart */
  if (cart.items.length === 0) {
    if (isMobile) {
      return (
        <div className="space-y-6">
          {/* Mobile Header (Figma: Carrinho de NFTs.pdf) */}
          <div className="flex items-center justify-between pb-2 pt-2">
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
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#271913] text-[#cbb89d] border border-white/5 shadow-sm active:scale-95 transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold font-mono text-[#f5f1eb] tracking-tight">
              Carrinho de NFTs
            </h1>
            <div className="w-11" aria-hidden="true" />
          </div>

          <div className="py-12 text-center space-y-4 rounded-3xl border border-[#301f18] bg-[#221612] p-8">
            <h2 className="text-xl font-bold font-mono text-[#f5f1eb]">Seu carrinho está vazio</h2>
            <p className="text-xs font-mono text-[#cbb89d]/75 max-w-xs mx-auto leading-relaxed">
              Explore o catálogo e adicione obras digitais raras de criadores emergentes e consagrados.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                hash="catalogo"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#c38346] px-6 font-mono text-xs font-bold text-[#140d0a] hover:bg-[#d49253] transition-colors"
              >
                Explorar NFTs
              </Link>
            </div>
          </div>

          {recommendations.length > 0 && (
            <section aria-labelledby="rec-empty-title" className="space-y-4 pt-4">
              <h2 id="rec-empty-title" className="text-base font-bold font-mono text-[#f5f1eb]">
                Colecionadores também viram
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.slice(0, 4).map((n) => (
                  <NFTCard key={n.id} nft={n} />
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <span aria-hidden>/</span>
          <Link to="/" hash="catalogo" className="hover:text-primary transition-colors">
            Mercado
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground font-medium">Carrinho</span>
        </nav>

        <div className="py-16 text-center space-y-4 rounded-xl border border-dashed border-border bg-card/40 p-12">
          <h1 className="text-2xl font-bold text-foreground">Seu carrinho está vazio</h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Explore o catálogo e adicione obras digitais raras de criadores emergentes e consagrados.
          </p>
          <div className="pt-2">
            <Link to="/" hash="catalogo" className={buttonVariants({ size: 'default' })}>
              Explorar NFTs
            </Link>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section aria-labelledby="rec-empty-title" className="space-y-6 border-t border-border pt-12">
            <h2 id="rec-empty-title" className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Colecionadores também viram
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {recommendations.map((n) => (
                <NFTCard key={n.id} nft={n} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  /* Mobile Cart View (Figma: Carrinho de NFTs.pdf) */
  if (isMobile) {
    return (
      <div className="space-y-5 pb-6">
        {/* Mobile Header */}
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#271913] text-[#cbb89d] border border-white/5 shadow-sm active:scale-95 transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="text-xl font-bold font-mono text-[#f5f1eb] tracking-tight">
            Carrinho de NFTs
          </h1>

          <div className="w-11" aria-hidden="true" />
        </div>

        {/* Cart Items List */}
        <ul className="space-y-3" aria-label="Itens no carrinho">
          {cart.items.map((i) => (
            <li
              key={i.editionId}
              className="relative flex items-center justify-between rounded-[24px] bg-[#221612] p-3 border border-[#301f18] transition-all"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Link to="/nft/$id" params={{ id: i.nftId }} className="shrink-0">
                  <img
                    src={i.imageUrl}
                    alt={i.name}
                    width={80}
                    height={80}
                    className="h-[76px] w-[76px] rounded-[18px] object-cover bg-black/40 border border-white/5"
                  />
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    to="/nft/$id"
                    params={{ id: i.nftId }}
                    className="block truncate font-mono text-[15px] font-bold text-[#f5f1eb] hover:text-[#c38346] transition-colors"
                  >
                    {i.name}
                  </Link>
                  <p className="font-mono text-xs text-[#cbb89d]/75">
                    Edição: {i.editionNumber}/{i.availableQuantity || 50}
                  </p>
                  <p className="font-mono text-sm font-bold text-[#c38346]">
                    {i.unitPriceEth} ETH
                  </p>
                </div>
              </div>

              {/* Top-Right Trash Button */}
              <button
                type="button"
                aria-label={`Remover ${i.name}`}
                onClick={() => remove.mutate({ nftId: i.nftId, editionId: i.editionId })}
                className="absolute top-3.5 right-3.5 text-[#cbb89d]/40 hover:text-[#c38346] active:scale-90 transition-all p-1 z-10"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {/* Right: Stepper */}
              <div
                className="flex items-center gap-1.5 shrink-0 pl-1 pt-4"
                role="group"
                aria-label={`Quantidade de ${i.name}`}
              >
                <button
                  type="button"
                  aria-label="Diminuir"
                  disabled={i.quantity <= 1}
                  onClick={() =>
                    update.mutate({
                      nftId: i.nftId,
                      editionId: i.editionId,
                      quantity: i.quantity - 1,
                    })
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a110d] text-[#cbb89d] border border-white/5 disabled:opacity-30 active:scale-95 transition-all text-xs font-bold"
                >
                  −
                </button>
                <span className="min-w-4 text-center font-mono text-xs font-bold text-[#f5f1eb]" aria-live="polite">
                  {i.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar"
                  disabled={i.quantity >= i.availableQuantity}
                  onClick={() =>
                    update.mutate({
                      nftId: i.nftId,
                      editionId: i.editionId,
                      quantity: i.quantity + 1,
                    })
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a110d] text-[#cbb89d] border border-white/5 disabled:opacity-30 active:scale-95 transition-all text-xs font-bold"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary Card (Figma: Carrinho de NFTs.pdf) */}
        <div className="mt-6 rounded-[28px] bg-[#221612] p-5 space-y-4 border border-[#301f18]">
          {/* Coupon Code Section */}
          {cart.appliedCoupon ? (
            <div className="flex items-center justify-between rounded-full bg-[#19100d] px-4 py-3 border border-[#38261e]">
              <span className="font-mono text-xs text-[#c38346] font-medium">
                Cupom <strong>{cart.appliedCoupon.code}</strong> aplicado
              </span>
              <button
                type="button"
                onClick={() => removeCoupon.mutate()}
                className="text-xs text-red-400 hover:text-red-300 font-mono font-semibold"
              >
                Remover
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCouponError(undefined);
                apply.mutate(code, {
                  onSuccess: () => setCode(''),
                  onError: (err) => setCouponError(errorMessage(err)),
                });
              }}
              className="space-y-1.5"
            >
              <div className="relative flex items-center rounded-full bg-[#19100d] p-1.5 pl-4 border border-[#38261e]">
                {!code && (
                  <span className="pointer-events-none absolute left-4 text-xs font-mono text-[#cbb89d]/60 select-none">
                    Digite o código promocional...
                  </span>
                )}
                <input
                  id="coupon-input"
                  aria-label="Cupom"
                  placeholder="Cupom"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-9 flex-1 bg-transparent pr-2 text-xs font-mono text-[#f5f1eb] placeholder:text-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!code.trim() || apply.isPending}
                  className="h-9 rounded-full bg-[#c38346] px-6 text-xs font-mono font-bold text-white hover:bg-[#d49253] active:scale-95 transition-all shadow-sm shrink-0"
                >
                  Aplicar
                </button>
              </div>
              {couponError && <p role="alert" className="text-xs text-red-400 font-mono pl-3">{couponError}</p>}
            </form>
          )}

          {/* Financial Breakdown */}
          <dl className="space-y-3 font-mono text-xs pt-1">
            <div className="flex justify-between items-center text-[#f5f1eb]">
              <dt>Subtotal</dt>
              <dd className="font-bold">{cart.subtotalEth} ETH</dd>
            </div>

            <div className="flex justify-between items-center text-[#f5f1eb]">
              <dt>Desconto do lançamento</dt>
              <dd className="font-bold text-[#f5f1eb]">
                {parseFloat(cart.discountEth) > 0 ? `(-) ${cart.discountEth} ETH` : '(-) 00.00'}
              </dd>
            </div>

            <div className="flex justify-between items-start text-[#f5f1eb]">
              <div>
                <dt>Taxa de rede</dt>
              </div>
              <div className="text-right">
                <dd className="font-bold">{cart.networkFeeEth} ETH</dd>
                <span className="text-[11px] text-[#c38346] block">Taxa estimada</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-[#f5f1eb]">
              <dt className="text-base font-bold">Total</dt>
              <dd className="text-lg font-extrabold text-[#c38346]">{cart.totalEth} ETH</dd>
            </div>
          </dl>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => navigate({ to: '/checkout' })}
            className="w-full h-13 py-3.5 rounded-full bg-[#c38346] text-[#140d0a] font-mono text-sm font-bold tracking-wide hover:bg-[#d49253] active:scale-98 transition-all shadow-md text-center block mt-3"
          >
            Conectar e finalizar
            <span className="sr-only"> / Ir para pagamento</span>
          </button>
        </div>
      </div>
    );
  }

  /* Desktop Cart View */
  return (
    <div className="space-y-16">
      {/* Breadcrumb Navigation (Figma: Início / Mercado / Carrinho) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">
          Início
        </Link>
        <span aria-hidden>/</span>
        <Link to="/" hash="catalogo" className="hover:text-primary transition-colors">
          Mercado
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium">Carrinho</span>
      </nav>

      {/* Main 2-Column Cart Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Cart Items Table */}
        <section aria-labelledby="cart-items-title" className="space-y-4">
          <h1 id="cart-items-title" className="sr-only">
            Itens no carrinho
          </h1>

          {/* Table Header (Figma: NFTs | Preço | Edições | Total) */}
          <div className="hidden grid-cols-[1fr_120px_130px_110px_40px] items-center border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid px-2">
            <div>NFTs</div>
            <div>Preço</div>
            <div className="text-center">Edições</div>
            <div className="text-right">Total</div>
            <div aria-hidden />
          </div>

          {/* Cart Items List */}
          <ul className="divide-y divide-border/60 rounded-xl border border-border bg-card">
            {cart.items.map((i) => (
              <li
                key={i.editionId}
                className="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-[1fr_120px_130px_110px_40px]"
              >
                {/* NFT thumbnail & info */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={i.imageUrl}
                    alt={i.name}
                    width={80}
                    height={80}
                    className="h-16 w-16 rounded-lg object-cover shrink-0 border border-border"
                  />
                  <div className="space-y-1 min-w-0">
                    <Link
                      to="/nft/$id"
                      params={{ id: i.nftId }}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors block truncate"
                    >
                      {i.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      ID do token: <span className="text-foreground">#{String(i.editionNumber).padStart(4, '0')}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {i.collection} · Edição #{i.editionNumber}
                    </p>
                  </div>
                </div>

                {/* Price Column */}
                <div className="text-xs font-mono font-medium text-foreground md:block flex justify-between">
                  <span className="text-muted-foreground md:hidden">Preço:</span>
                  <span>{i.unitPriceEth} ETH</span>
                </div>

                {/* Edições (Quantity Stepper) */}
                <div className="flex items-center justify-between md:justify-center">
                  <span className="text-muted-foreground text-xs md:hidden">Quantidade:</span>
                  <div
                    className="flex h-8 items-center rounded-md border border-border bg-background"
                    role="group"
                    aria-label={`Quantidade de ${i.name}`}
                  >
                    <button
                      type="button"
                      aria-label="Diminuir"
                      disabled={i.quantity <= 1}
                      onClick={() =>
                        update.mutate({
                          nftId: i.nftId,
                          editionId: i.editionId,
                          quantity: i.quantity - 1,
                        })
                      }
                      className="flex h-full w-7 items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-bold" aria-live="polite">
                      {i.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      disabled={i.quantity >= i.availableQuantity}
                      onClick={() =>
                        update.mutate({
                          nftId: i.nftId,
                          editionId: i.editionId,
                          quantity: i.quantity + 1,
                        })
                      }
                      className="flex h-full w-7 items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Column */}
                <div className="text-right text-xs font-mono font-bold text-primary md:block flex justify-between">
                  <span className="text-muted-foreground font-normal md:hidden">Total:</span>
                  <span>{i.totalPriceEth} ETH</span>
                </div>

                {/* Remove Button */}
                <div className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover ${i.name}`}
                    onClick={() => remove.mutate({ nftId: i.nftId, editionId: i.editionId })}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Right Column: Resumo da carteira (Figma) */}
        <aside aria-labelledby="wallet-summary-title" className="h-fit space-y-6 rounded-xl border border-border bg-card p-6">
          <h2 id="wallet-summary-title" className="text-lg font-bold text-foreground">
            Resumo da carteira
          </h2>

          {/* Código Promocional Section */}
          <div className="space-y-2">
            <label htmlFor="coupon-input" className="text-xs font-semibold text-foreground block">
              Código promocional
            </label>
            {cart.appliedCoupon ? (
              <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/10 p-2.5 text-xs">
                <span className="text-primary font-medium">
                  Cupom <strong>{cart.appliedCoupon.code}</strong> aplicado
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCoupon.mutate()}
                  className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <form
                className="space-y-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCouponError(undefined);
                  apply.mutate(code, {
                    onSuccess: () => setCode(''),
                    onError: (err) => setCouponError(errorMessage(err)),
                  });
                }}
              >
                <div className="flex gap-2">
                  <Input
                    id="coupon-input"
                    aria-label="Cupom"
                    placeholder="Cupom"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={!code.trim() || apply.isPending}
                    className="h-9 text-xs font-semibold px-4"
                  >
                    Aplicar
                  </Button>
                </div>
                {couponError && <p role="alert" className="text-xs text-destructive">{couponError}</p>}
              </form>
            )}
          </div>

          {/* Financial Breakdown (Figma) */}
          <dl className="space-y-2.5 border-t border-border pt-4 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="font-mono font-medium text-foreground">{cart.subtotalEth} ETH</dd>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <dt>Desconto do lançamento</dt>
              <dd className="font-mono font-medium text-primary">
                {parseFloat(cart.discountEth) > 0 ? `(-) ${cart.discountEth} ETH` : '(-) 00.00'}
              </dd>
            </div>
            <div className="flex justify-between items-start text-muted-foreground">
              <div>
                <dt>Taxa de rede</dt>
                <span className="text-[10px] text-muted-foreground/80 block">Taxa estimada</span>
              </div>
              <dd className="font-mono font-medium text-foreground">{cart.networkFeeEth} ETH</dd>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-3 text-sm font-bold text-foreground">
              <dt>Total</dt>
              <dd className="font-mono text-base text-primary font-extrabold">{cart.totalEth} ETH</dd>
            </div>
          </dl>

          {/* Action Buttons (Figma: Conectar e finalizar & Continuar explorando) */}
          <div className="space-y-2 pt-2">
            <Button
              className="w-full h-11 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Conectar e finalizar
              <span className="sr-only"> / Ir para pagamento</span>
            </Button>
            <Link
              to="/"
              hash="catalogo"
              className="block w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Continuar explorando
            </Link>
          </div>
        </aside>
      </div>

      {/* Section "Colecionadores também viram" (Figma) */}
      {recommendations.length > 0 && (
        <section aria-labelledby="rec-title" className="space-y-6 border-t border-border pt-12">
          <h2 id="rec-title" className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Colecionadores também viram
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {recommendations.map((n) => (
              <NFTCard key={n.id} nft={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
