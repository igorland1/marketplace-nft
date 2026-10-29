import { Link } from '@tanstack/react-router';
import { NFTItem } from '@/types';

export function NFTCard({ nft }: { nft: NFTItem }) {
  const soldOut = nft.editions.every((e) => e.availableQuantity <= 0);
  const isNeonVessel = nft.id === 'nft_3';
  const originalPrice = isNeonVessel ? '2.29' : null;

  return (
    <Link
      to="/nft/$id"
      params={{ id: nft.id }}
      className="group relative block rounded-lg bg-card p-3 transition hover:ring-1 hover:ring-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
        {soldOut && (
          <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            Esgotado
          </span>
        )}
        {nft.isFeatured && !soldOut && (
          <span className="rounded-sm bg-purple-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
            NFT em destaque
          </span>
        )}
        {isNeonVessel && (
          <span className="rounded-sm bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
            Oferta limitada
          </span>
        )}
      </div>

      <div className="aspect-square overflow-hidden rounded-md bg-background">
        <img
          src={nft.imageUrl}
          alt={nft.name}
          loading="lazy"
          width={360}
          height={360}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="space-y-1 pt-3 text-xs">
        <h3 className="truncate font-normal">{nft.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <p className="font-bold text-primary">{nft.priceEth} ETH</p>
          {originalPrice && (
            <p className="text-[11px] text-muted-foreground line-through">
              {originalPrice} ETH
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
