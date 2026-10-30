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
      className="group relative block rounded-2xl bg-transparent p-0 transition hover:ring-1 hover:ring-primary focus-visible:ring-2 focus-visible:ring-ring md:rounded-lg md:bg-card md:p-3"
    >
      {/* Desktop Badges */}
      <div className="absolute left-3 top-3 z-10 hidden flex-col items-start gap-1 md:flex">
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

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#221612] p-1 shadow-sm md:rounded-md md:bg-background md:p-0">
        {/* Mobile RARO badge (Figma: Início.pdf) */}
        {nft.isFeatured && !soldOut && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-sm bg-[#c87f42] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#16110d] shadow-sm md:hidden font-mono">
            RARO
          </span>
        )}

        {/* Mobile Heart/Favorite button (Figma: Início.pdf) */}
        <button
          type="button"
          aria-label="Favoritar"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-[#cbb89d] backdrop-blur-sm transition-colors hover:text-[#d28a4c] active:scale-95 md:hidden"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <img
          src={nft.imageUrl}
          alt={nft.name}
          loading="lazy"
          width={360}
          height={360}
          className="h-full w-full rounded-[18px] object-cover transition group-hover:scale-105 md:rounded-none"
        />
      </div>

      {/* Card Info Details */}
      <div className="space-y-0.5 pt-2 text-xs font-mono md:space-y-1 md:pt-3">
        <h3 className="truncate font-normal text-[#f5f1eb]">{nft.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <p className="font-bold text-[#d28a4c]">{nft.priceEth} ETH</p>
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
