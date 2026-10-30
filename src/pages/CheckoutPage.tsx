import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, useApplyCoupon } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { useWallets } from '@/hooks/useProfile';
import { orderService } from '@/services/api';
import { NetworkType } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Check, Tag } from 'lucide-react';

type Quote = Awaited<ReturnType<typeof orderService.getQuote>>;
type Conn = 'disconnected' | 'connecting' | 'connected' | 'refused';
const selectCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { data: wallets } = useWallets();
  const createOrder = useCreateOrder();
  const applyCouponMutation = useApplyCoupon();

  // Form Fields State
  const [customName, setCustomName] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState<string | null>(null);
  const [customUsername, setCustomUsername] = useState<string | null>(null);
  const [customProfileName, setCustomProfileName] = useState<string | null>(null);
  const [customWalletAddress, setCustomWalletAddress] = useState<string | null>(null);
  const [secondaryWallet, setSecondaryWallet] = useState('');
  const [referralCode, setReferralCode] = useState('KURIO-2026');
  const [ensName, setEnsName] = useState('satoshi');
  const [collectorNote, setCollectorNote] = useState('');

  // Wallet & Network State
  const [walletId, setWalletId] = useState('');
  const [network, setNetwork] = useState<NetworkType | ''>('');
  const [walletType, setWalletType] = useState('metamask');
  const [conn, setConn] = useState<Conn>('disconnected');
  const [simulateRefusal, setSimulateRefusal] = useState(false);

  // Promo Code State
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState<string>();

  // Review & Order State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<Quote>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [idemKey, setIdemKey] = useState(() => crypto.randomUUID());

  if (isLoading) {
    return (
      <div className="space-y-6 py-8">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <Skeleton className="h-[520px] rounded-xl" />
          <Skeleton className="h-[520px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-8 py-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <span aria-hidden>/</span>
          <Link to="/" hash="catalogo" className="hover:text-primary transition-colors">
            Mercado
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground font-medium">Pagamento</span>
        </nav>

        <div className="py-16 text-center space-y-4 rounded-xl border border-dashed border-border bg-card/40 p-12">
          <h1 className="text-2xl font-bold text-foreground">Nada para pagar</h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Seu carrinho está vazio. Escolha obras raras no mercado para iniciar sua coleção digital.
          </p>
          <div className="pt-2">
            <Link to="/" hash="catalogo" className={buttonVariants({ size: 'default' })}>
              Explorar NFTs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active wallet selection
  const wallet = wallets?.find((w) => w.id === (walletId || wallets.find((x) => x.isPrimary)?.id || wallets[0]?.id));
  const effectiveNetwork = (network || wallet?.network || 'ethereum') as NetworkType;

  // Derived field values
  const name = customName ?? user?.name ?? 'Satoshi Nakamoto';
  const email = customEmail ?? user?.email ?? 'satoshi@greenmint.io';
  const username = customUsername ?? (user?.username ? `@${user.username}` : '@satoshi');
  const profileName = customProfileName ?? 'Colecionador Pro';
  const walletAddress = customWalletAddress ?? wallet?.address ?? '0x71C...49b8';

  function connect() {
    setConn('connecting');
    setTimeout(() => {
      setConn(simulateRefusal ? 'refused' : 'connected');
    }, 500);
  }

  async function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    setPromoError(undefined);
    try {
      await applyCouponMutation.mutateAsync(promoCodeInput.trim());
      setQuote(undefined); // Invalidate existing quote to recalculate totals
      setPromoCodeInput('');
      setShowPromoInput(false);
    } catch (err) {
      setPromoError(errorMessage(err));
    }
  }

  async function review(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido.';
    if (!wallet && (!wallets || wallets.length === 0)) {
      errs.wallet = 'Selecione uma carteira cadastrada.';
    } else if (conn !== 'connected') {
      errs.wallet = 'Conecte a carteira para continuar.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setError(undefined);
    setBusy(true);
    try {
      const q = await orderService.getQuote();
      setQuote(q);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!wallet || !quote) return;
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const fresh = await orderService.getQuote();
      if (fresh.totalEth !== quote.totalEth) {
        setQuote(fresh);
        setNotice(`Os valores mudaram (${quote.totalEth} → ${fresh.totalEth} ETH). Revise e confirme novamente.`);
        return;
      }
      const order = await createOrder.mutateAsync({
        walletId: wallet.id,
        network: effectiveNetwork,
        idempotencyKey: idemKey,
      });
      setIdemKey(crypto.randomUUID());
      navigate({ to: '/orders/$id', params: { id: order.orderId } });
    } catch (err) {
      const msg = errorMessage(err);
      setError(msg);
      setQuote(undefined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation (Figma: Início / Mercado / Pagamento) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">
          Início
        </Link>
        <span aria-hidden>/</span>
        <Link to="/" hash="catalogo" className="hover:text-primary transition-colors">
          Mercado
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium">Pagamento</span>
      </nav>

      {/* Main 2-Column Checkout Layout */}
      <form onSubmit={review} noValidate className="grid gap-8 lg:grid-cols-[1fr_440px]">
        {/* Left Column: Perfil do colecionador */}
        <section aria-labelledby="collector-profile-heading" className="space-y-6">
          <div className="space-y-1">
            <h1 id="collector-profile-heading" className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Perfil do colecionador
            </h1>
            <p className="text-xs text-muted-foreground">
              Confirme suas credenciais para cunhagem e registro do certificado de autenticidade.
            </p>
          </div>

          <fieldset disabled={busy} className="space-y-5 rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Row 1: Nome de exibição & Nome de usuário */}
              <div className="space-y-1">
                <label htmlFor="displayName" className="text-xs font-semibold text-foreground">
                  Nome de exibição <span className="text-destructive">*</span>
                </label>
                <Input
                  id="displayName"
                  value={name}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nome de exibição"
                  className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.name && (
                  <p role="alert" className="text-[11px] text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="username" className="text-xs font-semibold text-foreground">
                  Nome de usuário <span className="text-destructive">*</span>
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="@satoshi"
                />
              </div>

              {/* Row 2: Rede & Nome do perfil */}
              <div className="space-y-1">
                <label htmlFor="network" className="text-xs font-semibold text-foreground">
                  Rede <span className="text-destructive">*</span>
                </label>
                <select
                  id="network"
                  className={selectCls}
                  value={effectiveNetwork}
                  onChange={(e) => {
                    setNetwork(e.target.value as NetworkType);
                    setQuote(undefined);
                  }}
                >
                  <option value="ethereum">Ethereum (Mainnet)</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum One</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="profileName" className="text-xs font-semibold text-foreground">
                  Nome do perfil <span className="text-destructive">*</span>
                </label>
                <Input
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setCustomProfileName(e.target.value)}
                  placeholder="Nome do perfil"
                />
              </div>

              {/* Row 3: Endereço da carteira & ENS secundária */}
              <div className="space-y-1">
                <label htmlFor="walletAddress" className="text-xs font-semibold text-foreground">
                  Endereço da carteira <span className="text-destructive">*</span>
                </label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setCustomWalletAddress(e.target.value)}
                  placeholder="Endereço 0x da carteira"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="secondaryWallet" className="text-xs font-semibold text-foreground">
                  ENS ou carteira secundária (opcional)
                </label>
                <Input
                  id="secondaryWallet"
                  value={secondaryWallet}
                  onChange={(e) => setSecondaryWallet(e.target.value)}
                  placeholder="ENS ou carteira secundária (opcional)"
                  className="font-mono text-xs"
                />
              </div>

              {/* Row 4: Tipo de carteira & Código de indicação */}
              <div className="space-y-1">
                <label htmlFor="walletType" className="text-xs font-semibold text-foreground">
                  Tipo de carteira <span className="text-destructive">*</span>
                </label>
                <select
                  id="walletType"
                  className={selectCls}
                  value={walletType}
                  onChange={(e) => {
                    setWalletType(e.target.value);
                    setConn('disconnected');
                    setQuote(undefined);
                  }}
                >
                  <option value="metamask">MetaMask</option>
                  <option value="coinbase">Coinbase Wallet</option>
                  <option value="walletconnect">WalletConnect</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="referralCode" className="text-xs font-semibold text-foreground">
                  Código de indicação <span className="text-destructive">*</span>
                </label>
                <Input
                  id="referralCode"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Código de indicação"
                  className="font-mono text-xs"
                />
              </div>

              {/* Row 5: E-mail & Nome ENS */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-foreground">
                  E-mail <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="satoshi@greenmint.io"
                  className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.email && (
                  <p role="alert" className="text-[11px] text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="ensName" className="text-xs font-semibold text-foreground">
                  Nome ENS <span className="text-destructive">*</span>
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="ensName"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    placeholder="satoshi"
                    className="pr-14 font-mono text-xs"
                  />
                  <span className="pointer-events-none absolute right-3 rounded bg-muted/80 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    .eth
                  </span>
                </div>
              </div>
            </div>

            {/* Checkbox: Usar outra carteira? (Também usado no teste para simular recusa) */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateRefusal}
                  onChange={(e) => setSimulateRefusal(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span>
                  Usar outra carteira?{' '}
                  <span className="text-[11px] text-muted-foreground/80">(simular recusa de conexão)</span>
                </span>
              </label>
            </div>

            {/* Observação do colecionador (opcional) */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label htmlFor="collectorNote" className="text-xs font-semibold text-foreground">
                Observação do colecionador (opcional)
              </label>
              <textarea
                id="collectorNote"
                rows={3}
                value={collectorNote}
                onChange={(e) => setCollectorNote(e.target.value)}
                placeholder="Instruções para transferência de custódia ou observações especiais da coleção..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </fieldset>
        </section>

        {/* Right Column: Seus NFTs & Carteira e rede */}
        <div className="space-y-6">
          {/* Section: Seus NFTs (Order Summary) */}
          <aside aria-labelledby="order-nfts-heading" className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 id="order-nfts-heading" className="text-base font-bold text-foreground">
                Seus NFTs
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {cart.items.reduce((acc, i) => acc + i.quantity, 0)} itens
              </span>
            </div>

            {/* Table Header: NFTs / Subtotal */}
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>

            {/* Cart Items List */}
            <ul className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
              {cart.items.map((i) => (
                <li key={i.editionId} className="flex items-center gap-3 py-3">
                  <img
                    src={i.imageUrl}
                    alt={i.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-xs font-semibold text-foreground">{i.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      ID do token: #{String(i.editionNumber).padStart(4, '0')}
                    </p>
                    <p className="text-[11px] text-muted-foreground">(x {i.quantity})</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-foreground">{i.totalPriceEth} ETH</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Promo Code Section */}
            <div className="border-t border-border/80 pt-3">
              {cart.appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-medium">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Cupom: {cart.appliedCoupon.code}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary">
                    -{cart.appliedCoupon.discountPercentage}%
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {!showPromoInput ? (
                    <button
                      type="button"
                      onClick={() => setShowPromoInput(true)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Tem um código promocional? Aplique aqui
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder="Código promocional"
                          className="h-8 text-xs font-mono"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleApplyPromo}
                          disabled={!promoCodeInput.trim() || applyCouponMutation.isPending}
                          className="h-8 text-xs font-medium"
                        >
                          Aplicar
                        </Button>
                      </div>
                      {promoError && (
                        <p role="alert" className="text-[11px] text-destructive">
                          {promoError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <dl className="space-y-2.5 border-t border-border pt-3.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="font-mono font-medium text-foreground">
                  {(quote ?? cart).subtotalEth} ETH
                </dd>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <dt>Desconto do lançamento</dt>
                <dd className="font-mono font-medium text-foreground">
                  {parseFloat((quote ?? cart).discountEth || '0') > 0
                    ? `(-) ${(quote ?? cart).discountEth} ETH`
                    : '(-) 00.00'}
                </dd>
              </div>

              <div className="flex items-start justify-between text-muted-foreground">
                <div>
                  <dt>Taxa de rede</dt>
                  <span className="block text-[10px] text-muted-foreground/75">Taxa estimada</span>
                </div>
                <dd className="font-mono font-medium text-foreground">
                  {(quote ?? cart).networkFeeEth} ETH
                </dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-sm font-bold text-foreground">Total</dt>
                <dd className="font-mono text-lg font-bold text-primary">
                  {(quote ?? cart).totalEth} ETH
                </dd>
              </div>
            </dl>
          </aside>

          {/* Section: Carteira e rede */}
          <aside aria-labelledby="wallet-network-heading" className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-1">
              <h2 id="wallet-network-heading" className="text-base font-bold text-foreground">
                Carteira e rede
              </h2>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                METAMASK &nbsp;•&nbsp; WALLETCONNECT &nbsp;•&nbsp; COINBASE
              </p>
            </div>

            {/* Wallet Selection Cards (Figma style) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setWalletType('metamask');
                  if (conn === 'refused') setConn('disconnected');
                }}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all',
                  walletType === 'metamask'
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border bg-card/40 text-muted-foreground hover:border-border/80 hover:text-foreground'
                )}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-orange-500/10 text-xs font-bold text-orange-400">
                  M
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-tight">MetaMask</p>
                  <p className="truncate text-[10px] text-muted-foreground">Navegador</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWalletType('coinbase');
                  if (conn === 'refused') setConn('disconnected');
                }}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all',
                  walletType === 'coinbase'
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border bg-card/40 text-muted-foreground hover:border-border/80 hover:text-foreground'
                )}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-500/10 text-xs font-bold text-blue-400">
                  C
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-tight">Coinbase Wallet</p>
                  <p className="truncate text-[10px] text-muted-foreground">Auto-custódia</p>
                </div>
              </button>
            </div>

            {/* Registered Wallets Dropdown */}
            {wallets && wallets.length > 0 && (
              <div className="space-y-1">
                <label htmlFor="wallet" className="text-[11px] font-medium text-muted-foreground">
                  Carteira cadastrada
                </label>
                <select
                  id="wallet"
                  className={selectCls}
                  value={wallet?.id ?? ''}
                  onChange={(e) => {
                    setWalletId(e.target.value);
                    setConn('disconnected');
                    setQuote(undefined);
                  }}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} ({w.address}) · {w.balanceEth} ETH{w.isPrimary ? ' · principal' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Connection Actions & Status */}
            <div className="space-y-3 pt-1">
              {conn === 'connected' ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span role="status" className="text-xs font-semibold text-emerald-400">
                      ✓ Conectada
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setConn('disconnected');
                      setQuote(undefined);
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={connect}
                    disabled={conn === 'connecting'}
                    className="w-full h-11 text-xs font-bold tracking-wider uppercase border-border/80"
                  >
                    {conn === 'connecting' ? 'Conectando…' : 'Conectar carteira'}
                  </Button>
                  {conn === 'refused' && (
                    <p role="alert" className="text-center text-xs font-medium text-destructive">
                      Conexão recusada pela carteira.
                    </p>
                  )}
                </div>
              )}

              {errors.wallet && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.wallet}
                </p>
              )}

              {error && (
                <p role="alert" className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="rounded-md bg-primary/10 p-2.5 text-xs text-primary">
                  {notice}
                </p>
              )}

              {/* Primary Flow Action Button */}
              {!quote ? (
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 text-xs font-bold tracking-wider uppercase shadow-sm"
                >
                  {busy ? 'Verificando…' : 'Revisar pedido'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={confirm}
                    className="w-full h-12 text-xs font-bold tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  >
                    {busy ? 'Enviando…' : `Confirmar compra · ${quote.totalEth} ETH`}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => setQuote(undefined)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    Voltar e editar
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
