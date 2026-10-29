import { useState } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { useNFTDetail, useToggleFavorite } from '@/hooks/useNFTs';
import { useAddToCart, useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';

export function NFTDetailPage() {
  const { id } = useParams({ from: '/nft/$id' });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: nft, isLoading, error } = useNFTDetail(id);
  const { data: cart } = useCart();
  const fav = useToggleFavorite();
  const add = useAddToCart();
  const [editionId, setEditionId] = useState<string>();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  if (isLoading) return <Skeleton className="h-96" />;
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return (
      <div className="py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">NFT não encontrado</h1>
        <Link to="/" className={buttonVariants()}>Voltar ao catálogo</Link>
      </div>
    );
  }
  if (!nft) return <div role="alert">Não foi possível carregar o NFT.</div>;

  const edition = nft.editions.find((e) => e.id === (editionId ?? nft.editions.find((x) => x.availableQuantity > 0)?.id ?? nft.editions[0].id))!;
  const inCart = cart?.items.find((i) => i.editionId === edition.id)?.quantity ?? 0;
  const maxQty = Math.max(0, Math.min(edition.maxQuantityPerUser, edition.availableQuantity) - inCart);
  const unavailable = edition.availableQuantity <= 0 || edition.status === 'sold_out';
  const safeQty = Math.min(Math.max(1, qty), Math.max(1, maxQty));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <img src={nft.imageUrl} alt={nft.name} className="aspect-square w-full rounded-lg object-cover" />
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{nft.collection} · {nft.tokenId}</p>
        <h1 className="text-3xl font-bold">{nft.name}</h1>
        <p className="text-muted-foreground">{nft.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <img src={nft.creator.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
          {nft.creator.name} {nft.creator.verified && <Badge tone="success">Verificado</Badge>}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Edição</legend>
          <div className="flex flex-wrap gap-2">
            {nft.editions.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={e.id === edition.id}
                onClick={() => { setEditionId(e.id); setQty(1); setMsg(undefined); }}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${e.id === edition.id ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                #{e.editionNumber}/{e.totalEditions} · {e.priceEth} ETH
                {e.availableQuantity <= 0 && <span className="ml-2 text-destructive">Esgotada</span>}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="text-3xl font-bold text-primary">{edition.priceEth} ETH</p>
        <p className="text-sm text-muted-foreground">
          {unavailable ? 'Edição indisponível' : `${edition.availableQuantity} disponíveis · limite de ${edition.maxQuantityPerUser} por colecionador`}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1" role="group" aria-label="Quantidade">
            <Button variant="outline" size="icon" aria-label="Diminuir" disabled={safeQty <= 1} onClick={() => setQty(safeQty - 1)}>−</Button>
            <span className="w-8 text-center" aria-live="polite">{safeQty}</span>
            <Button variant="outline" size="icon" aria-label="Aumentar" disabled={safeQty >= maxQty} onClick={() => setQty(safeQty + 1)}>+</Button>
          </div>
          <Button
            disabled={unavailable || maxQty <= 0 || add.isPending}
            onClick={() =>
              add.mutate(
                { nftId: nft.id, editionId: edition.id, quantity: safeQty },
                {
                  onSuccess: () => { setMsg({ ok: true, text: 'Adicionado ao carrinho.' }); setQty(1); },
                  onError: (e) => setMsg({ ok: false, text: errorMessage(e) }),
                },
              )
            }
          >
            {maxQty <= 0 && !unavailable ? 'Limite atingido' : 'Adicionar ao carrinho'}
          </Button>
          <Button
            variant="outline"
            aria-pressed={!!nft.isLiked}
            onClick={() => (isAuthenticated ? fav.mutate(nft.id) : navigate({ to: '/login', search: { redirect: `/nft/${nft.id}` } }))}
          >
            <Heart className={`mr-1 h-4 w-4 ${nft.isLiked ? 'fill-destructive text-destructive' : ''}`} aria-hidden /> {nft.likesCount}
          </Button>
        </div>
        {msg && <p role="status" className={msg.ok ? 'text-primary text-sm' : 'text-destructive text-sm'}>{msg.text}</p>}

        <div>
          <h2 className="mb-2 font-semibold">Atributos</h2>
          <ul className="grid grid-cols-2 gap-2">
            {nft.attributes.map((a) => (
              <li key={a.traitType} className="rounded-lg border p-2 text-sm">
                <span className="block text-xs text-muted-foreground">{a.traitType}</span>
                {a.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
