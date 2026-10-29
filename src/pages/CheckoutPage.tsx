import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { useWallets } from '@/hooks/useProfile';
import { orderService } from '@/services/api';
import { NetworkType } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';

type Quote = Awaited<ReturnType<typeof orderService.getQuote>>;
type Conn = 'disconnected' | 'connecting' | 'connected' | 'refused';
const selectCls = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';

export function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { data: wallets } = useWallets();
  const createOrder = useCreateOrder();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [walletId, setWalletId] = useState('');
  const [network, setNetwork] = useState<NetworkType | ''>('');
  const [conn, setConn] = useState<Conn>('disconnected');
  const [simulateRefusal, setSimulateRefusal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<Quote>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  // Stable per attempt: retries after timeout reuse the same key -> no duplicated orders
  const [idemKey, setIdemKey] = useState(() => crypto.randomUUID());

  if (isLoading) return <Skeleton className="h-64" />;
  if (!cart || cart.items.length === 0)
    return (
      <div className="py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Nada para pagar</h1>
        <Link to="/" className={buttonVariants()}>Explorar NFTs</Link>
      </div>
    );

  const wallet = wallets?.find((w) => w.id === (walletId || wallets.find((x) => x.isPrimary)?.id));
  const effectiveNetwork = (network || wallet?.network || 'ethereum') as NetworkType;

  function connect() {
    setConn('connecting');
    setTimeout(() => setConn(simulateRefusal ? 'refused' : 'connected'), 600);
  }

  async function review(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido.';
    if (!wallet) errs.wallet = 'Selecione uma carteira.';
    else if (conn !== 'connected') errs.wallet = 'Conecte a carteira para continuar.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setError(undefined);
    setBusy(true);
    try {
      setQuote(await orderService.getQuote());
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
      // Revalidate price, availability, coupon and fees right before submitting
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
      // Price/stock changes need a fresh confirmation
      setQuote(undefined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={review} noValidate className="space-y-6">
        <h1 className="text-2xl font-bold">Pagamento</h1>
        <fieldset disabled={!!quote} className="space-y-4">
          <legend className="font-semibold">Dados do colecionador</legend>
          <Field id="c-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Field id="c-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        </fieldset>

        <fieldset disabled={!!quote} className="space-y-3">
          <legend className="font-semibold">Carteira e rede</legend>
          {wallets && wallets.length === 0 ? (
            <p className="text-sm">Nenhuma carteira cadastrada. <Link to="/wallets" className="underline">Cadastrar carteira</Link></p>
          ) : (
            <>
              <label className="block text-sm font-medium" htmlFor="wallet">Carteira</label>
              <select id="wallet" className={selectCls} value={wallet?.id ?? ''} onChange={(e) => { setWalletId(e.target.value); setConn('disconnected'); }}>
                {wallets?.map((w) => (
                  <option key={w.id} value={w.id}>{w.label} ({w.address}) · {w.balanceEth} ETH{w.isPrimary ? ' · principal' : ''}</option>
                ))}
              </select>
              <label className="block text-sm font-medium" htmlFor="network">Rede</label>
              <select id="network" className={selectCls} value={effectiveNetwork} onChange={(e) => setNetwork(e.target.value as NetworkType)}>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={simulateRefusal} onChange={(e) => setSimulateRefusal(e.target.checked)} /> Simular recusa de conexão
              </label>
              <div className="flex items-center gap-3">
                {conn === 'connected' ? (
                  <Button type="button" variant="outline" onClick={() => setConn('disconnected')}>Desconectar</Button>
                ) : (
                  <Button type="button" variant="outline" onClick={connect} disabled={conn === 'connecting'}>
                    {conn === 'connecting' ? 'Conectando…' : 'Conectar carteira'}
                  </Button>
                )}
                <span role="status" className="text-sm">
                  {conn === 'connected' && '✓ Conectada'}
                  {conn === 'refused' && <span className="text-red-600">Conexão recusada pela carteira.</span>}
                </span>
              </div>
            </>
          )}
          {errors.wallet && <p role="alert" className="text-xs text-red-600">{errors.wallet}</p>}
        </fieldset>

        {error && <p role="alert" className="rounded bg-red-500/10 p-2 text-sm text-red-600">{error}</p>}
        {notice && <p role="status" className="rounded bg-amber-500/10 p-2 text-sm text-amber-700">{notice}</p>}

        {!quote ? (
          <Button type="submit" disabled={busy}>{busy ? 'Verificando…' : 'Revisar pedido'}</Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={() => setQuote(undefined)}>Editar</Button>
            <Button type="button" disabled={busy} onClick={confirm}>{busy ? 'Enviando…' : `Confirmar compra · ${quote.totalEth} ETH`}</Button>
          </div>
        )}
      </form>

      <aside aria-labelledby="order-sum" className="h-fit space-y-3 rounded-xl border p-4">
        <h2 id="order-sum" className="font-bold">Seu pedido</h2>
        <ul className="space-y-1 text-sm">
          {cart.items.map((i) => (
            <li key={i.editionId} className="flex justify-between"><span>{i.quantity}× {i.name}</span><span>{i.totalPriceEth} ETH</span></li>
          ))}
        </ul>
        <dl className="space-y-1 border-t pt-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{(quote ?? cart).subtotalEth} ETH</dd></div>
          <div className="flex justify-between"><dt>Desconto</dt><dd>− {(quote ?? cart).discountEth} ETH</dd></div>
          <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{(quote ?? cart).networkFeeEth} ETH</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{(quote ?? cart).totalEth} ETH</dd></div>
        </dl>
      </aside>
    </div>
  );
}
