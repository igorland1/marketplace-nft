import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useApplyCoupon, useCart, useRemoveCoupon, useRemoveFromCart, useUpdateCartQuantity } from '@/hooks/useCart';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';

export function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const update = useUpdateCartQuantity();
  const remove = useRemoveFromCart();
  const apply = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState<string>();
  const navigate = useNavigate();

  if (isLoading) return <Skeleton className="h-64" />;
  if (isError || !cart)
    return (
      <div role="alert" className="py-10 text-center">
        <p className="mb-3">Falha ao carregar o carrinho.</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  if (cart.items.length === 0)
    return (
      <div className="py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <Link to="/" className={buttonVariants()}>Explorar NFTs</Link>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section aria-labelledby="cart-title" className="space-y-3">
        <h1 id="cart-title" className="text-2xl font-bold">Carrinho de NFTs</h1>
        <ul className="space-y-3">
          {cart.items.map((i) => (
            <li key={i.editionId} className="flex gap-3 rounded-xl border p-3">
              <img src={i.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to="/nft/$id" params={{ id: i.nftId }} className="font-semibold hover:underline">{i.name}</Link>
                <p className="text-xs text-muted-foreground">{i.collection} · Edição #{i.editionNumber}</p>
                <p className="text-sm">{i.unitPriceEth} ETH</p>
                <div className="mt-2 flex items-center gap-1" role="group" aria-label={`Quantidade de ${i.name}`}>
                  <Button variant="outline" size="icon" aria-label="Diminuir" disabled={i.quantity <= 1}
                    onClick={() => update.mutate({ nftId: i.nftId, editionId: i.editionId, quantity: i.quantity - 1 })}>−</Button>
                  <span className="w-8 text-center">{i.quantity}</span>
                  <Button variant="outline" size="icon" aria-label="Aumentar" disabled={i.quantity >= i.availableQuantity}
                    onClick={() => update.mutate({ nftId: i.nftId, editionId: i.editionId, quantity: i.quantity + 1 })}>+</Button>
                </div>
                {i.quantity >= i.availableQuantity && <p className="mt-1 text-xs text-amber-600">Quantidade máxima disponível.</p>}
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-semibold">{i.totalPriceEth} ETH</span>
                <Button variant="ghost" size="icon" aria-label={`Remover ${i.name}`}
                  onClick={() => remove.mutate({ nftId: i.nftId, editionId: i.editionId })}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside aria-labelledby="summary" className="h-fit space-y-4 rounded-xl border p-4">
        <h2 id="summary" className="font-bold">Resumo</h2>
        {cart.appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-2 text-sm">
            <span>Cupom <strong>{cart.appliedCoupon.code}</strong> aplicado</span>
            <Button variant="ghost" size="sm" onClick={() => removeCoupon.mutate()}>Remover</Button>
          </div>
        ) : (
          <form
            className="space-y-1"
            onSubmit={(e) => {
              e.preventDefault();
              setCouponError(undefined);
              apply.mutate(code, { onSuccess: () => setCode(''), onError: (err) => setCouponError(errorMessage(err)) });
            }}
          >
            <div className="flex gap-2">
              <Input aria-label="Cupom" placeholder="Cupom" value={code} onChange={(e) => setCode(e.target.value)} />
              <Button type="submit" variant="outline" disabled={!code.trim() || apply.isPending}>Aplicar</Button>
            </div>
            {couponError && <p role="alert" className="text-xs text-red-600">{couponError}</p>}
          </form>
        )}
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{cart.subtotalEth} ETH</dd></div>
          <div className="flex justify-between"><dt>Desconto</dt><dd>− {cart.discountEth} ETH</dd></div>
          <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{cart.networkFeeEth} ETH</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{cart.totalEth} ETH</dd></div>
        </dl>
        <Button className="w-full" onClick={() => navigate({ to: '/checkout' })}>Ir para pagamento</Button>
      </aside>
    </div>
  );
}
