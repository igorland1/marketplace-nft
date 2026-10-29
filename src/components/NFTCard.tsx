import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { NFTItem } from '@/types';
import { Badge } from '@/components/ui/badge';

export function NFTCard({ nft }: { nft: NFTItem }) {
  const soldOut = nft.editions.every((e) => e.availableQuantity <= 0);
  return (
    <Link
      to="/nft/$id"
      params={{ id: nft.id }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={nft.imageUrl}
          alt={nft.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="space-y-1 p-3">
        <p className="text-xs text-muted-foreground">{nft.collection}</p>
        <h3 className="truncate font-semibold">{nft.name}</h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-emerald-600">{nft.priceEth} ETH</span>
          {soldOut ? (
            <Badge tone="danger">Esgotado</Badge>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" aria-hidden /> {nft.likesCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
