import { Link } from '@tanstack/react-router';
import { NFTItem } from '@/types';

export function NFTCard({ nft }: { nft: NFTItem }) {
  const soldOut = nft.editions.every((e) => e.availableQuantity <= 0);
  return (
    <Link
      to="/nft/$id"
      params={{ id: nft.id }}
      className="group relative block rounded-lg bg-card p-3 transition hover:ring-1 hover:ring-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      {soldOut && <span className="absolute left-3 top-3 z-10 bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Esgotado</span>}
      <div className="aspect-square overflow-hidden rounded-md bg-background">
        <img src={nft.imageUrl} alt={nft.name} loading="lazy" width={360} height={360} className="h-full w-full object-cover transition group-hover:scale-105" />
      </div>
      <div className="space-y-1 pt-3 text-xs">
        <h3 className="truncate font-normal">{nft.name}</h3>
        <p className="font-bold text-primary">{nft.priceEth} ETH</p>
      </div>
    </Link>
  );
}
