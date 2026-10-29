import { Link, useParams } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import { useOrderDetail } from '@/hooks/useOrders';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function OrderPage() {
  const { id } = useParams({ from: '/orders/$id' });
  const { data: order, isLoading, isError } = useOrderDetail(id);

  if (isLoading) return <Skeleton className="h-64" />;
  if (isError || !order)
    return (
      <div className="py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
        <Link to="/" className={buttonVariants()}>Voltar ao catálogo</Link>
      </div>
    );
  // Receipt is shown only for confirmed orders
  if (order.status !== 'confirmed')
    return (
      <div className="py-16 text-center space-y-2" role="status">
        <h1 className="text-2xl font-bold">{order.status === 'pending' ? 'Pedido pendente' : 'Pedido recusado'}</h1>
        {order.failureReason && <p>{order.failureReason}</p>}
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
        <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
        <p className="text-sm text-muted-foreground">Pedido {order.orderId} · {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
      </div>
      <section aria-labelledby="tx" className="rounded-xl border p-4 text-sm space-y-1">
        <h2 id="tx" className="font-semibold">Transação</h2>
        <p className="break-all">Hash: {order.transactionHash}</p>
        <p>Rede: {order.network} · Carteira: {order.walletAddress}</p>
        <a href={order.explorerUrl} target="_blank" rel="noreferrer" className="underline">Ver no explorador (simulado)</a>
      </section>
      <ul className="space-y-2">
        {order.items.map((i) => (
          <li key={i.editionId} className="flex items-center gap-3 rounded-xl border p-3">
            <img src={i.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">{i.name}</p>
              <p className="text-muted-foreground">Edição #{i.editionNumber} · {i.quantity}× {i.unitPriceEth} ETH</p>
            </div>
            <span className="text-sm font-semibold">{i.totalPriceEth} ETH</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1 rounded-xl border p-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{order.subtotalEth} ETH</dd></div>
        <div className="flex justify-between"><dt>Desconto</dt><dd>− {order.discountEth} ETH</dd></div>
        <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{order.networkFeeEth} ETH</dd></div>
        <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{order.totalEth} ETH</dd></div>
      </dl>
      <div className="text-center"><Link to="/" className={buttonVariants()}>Continuar explorando</Link></div>
    </div>
  );
}
