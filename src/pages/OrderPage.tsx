import { Link, useParams } from '@tanstack/react-router';
import { Check, ExternalLink, ArrowRight } from 'lucide-react';
import { useOrderDetail } from '@/hooks/useOrders';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function OrderPage() {
  const { id } = useParams({ from: '/orders/$id' });
  const { data: order, isLoading, isError } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-12">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Pedido não encontrado</h1>
        <p className="text-xs text-muted-foreground">
          Não conseguimos localizar o comprovante solicitado. Ele pode ter expirado ou o identificador é inválido.
        </p>
        <div className="pt-2">
          <Link to="/" hash="catalogo" className={buttonVariants({ size: 'default' })}>
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Shown if order was rejected or is still pending
  if (order.status !== 'confirmed') {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center space-y-4" role="status">
        <h1 className="text-2xl font-bold text-foreground">
          {order.status === 'pending' ? 'Pedido pendente' : 'Pedido recusado'}
        </h1>
        {order.failureReason && (
          <p className="text-xs text-destructive">{order.failureReason}</p>
        )}
        <div className="pt-2">
          <Link to="/cart" className={buttonVariants({ variant: 'outline' })}>
            Voltar ao carrinho
          </Link>
        </div>
      </div>
    );
  }

  const shortTx =
    order.transactionHash && order.transactionHash.length > 14
      ? `${order.transactionHash.slice(0, 6)}…${order.transactionHash.slice(-4)}`
      : order.transactionHash || '0xA91F…E82C';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const walletDisplay =
    order.network === 'ethereum'
      ? 'MetaMask'
      : order.walletAddress
        ? `${order.walletAddress.slice(0, 6)}…${order.walletAddress.slice(-4)}`
        : 'MetaMask';

  const explorerLabel =
    order.network === 'ethereum'
      ? 'Etherscan'
      : order.network === 'polygon'
        ? 'Polygonscan'
        : 'Arbiscan';

  return (
    <div className="space-y-6 py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">
          Início
        </Link>
        <span aria-hidden>/</span>
        <Link to="/" hash="catalogo" className="hover:text-primary transition-colors">
          Mercado
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium">Confirmação de pedido</span>
      </nav>

      {/* Confirmation Card (Figma: Confirmação de Pedido Modal/Receipt) */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8 space-y-6">
        {/* Header with Circular Checkmark Badge & Title */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-2">
          <div
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40 shadow-sm"
          >
            <Check className="h-7 w-7 stroke-[2.5]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Pedido confirmado!
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Seus NFTs agora estão na sua carteira
          </h1>

          <p className="text-xs text-muted-foreground font-mono">
            Pedido #{order.orderId}
          </p>
        </div>

        {/* 4 Summary Metrics (Figma: ID da transação, Data, Total, Carteira) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border/80 bg-background/50 p-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              ID da transação
            </span>
            <p className="font-mono text-xs font-bold text-foreground truncate" title={order.transactionHash}>
              Hash: {shortTx}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Data
            </span>
            <p className="text-xs font-bold text-foreground">
              {formattedDate}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <p className="font-mono text-xs font-bold text-primary">
              {order.totalEth} ETH
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Carteira
            </span>
            <p className="text-xs font-bold text-foreground truncate" title={order.walletAddress}>
              {walletDisplay}
            </p>
          </div>
        </div>

        {/* Transaction Items Section (Figma: Detalhes da transação) */}
        <section aria-labelledby="tx-details-title" className="space-y-3">
          <h2 id="tx-details-title" className="text-sm font-bold tracking-wide text-foreground">
            Detalhes da transação
          </h2>

          <div className="overflow-hidden rounded-xl border border-border bg-background/30">
            {/* Table Header: NFTs | Edições | Subtotal */}
            <div className="grid grid-cols-[1fr_80px_100px] sm:grid-cols-[1fr_100px_120px] items-center border-b border-border/70 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>NFTs</span>
              <span className="text-center">Edições</span>
              <span className="text-right">Subtotal</span>
            </div>

            {/* Items List */}
            <ul className="divide-y divide-border/50">
              {order.items.map((i) => (
                <li
                  key={i.editionId}
                  className="grid grid-cols-[1fr_80px_100px] sm:grid-cols-[1fr_100px_120px] items-center px-4 py-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={i.imageUrl}
                      alt={i.name}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover border border-border"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-semibold text-foreground">{i.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        ID do token: #{String(i.editionNumber).padStart(4, '0')}
                      </p>
                    </div>
                  </div>

                  <div className="text-center font-mono text-muted-foreground">
                    (x {i.quantity})
                  </div>

                  <div className="text-right font-mono font-bold text-foreground">
                    {i.totalPriceEth} ETH
                  </div>
                </li>
              ))}
            </ul>

            {/* Bottom Financial Totals */}
            <div className="border-t border-border/80 bg-background/50 p-4 space-y-2 text-xs">
              {parseFloat(order.discountEth || '0') > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Desconto</span>
                  <span className="font-mono font-medium text-foreground">− {order.discountEth} ETH</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de rede</span>
                <span className="font-mono font-medium text-foreground">{order.networkFeeEth} ETH</span>
              </div>

              <div className="flex items-baseline justify-between border-t border-border/60 pt-2 text-sm font-bold">
                <span className="text-foreground">Total</span>
                <span className="font-mono text-base font-bold text-primary">{order.totalEth} ETH</span>
              </div>
            </div>
          </div>
        </section>

        {/* Confirmation Message */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Transação confirmada na <strong className="text-foreground capitalize">{order.network}</strong>. A propriedade foi transferida para sua carteira conectada e registrada na rede.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={order.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'w-full sm:w-auto h-11 px-6 text-xs font-bold uppercase tracking-wider gap-2 shadow-sm'
            )}
          >
            <span>Ver no {explorerLabel}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <Link
            to="/profile"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'w-full sm:w-auto h-11 px-6 text-xs font-bold uppercase tracking-wider gap-2'
            )}
          >
            <span>Minha coleção</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
