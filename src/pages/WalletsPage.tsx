import { useState } from 'react';
import { useSaveWallet, useWallets } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';
import { NetworkType, Wallet } from '@/types';

function WalletForm({ wallet, onDone }: { wallet?: Wallet; onDone: () => void }) {
  const save = useSaveWallet();
  const [label, setLabel] = useState(wallet?.label ?? '');
  const [address, setAddress] = useState(wallet?.address ?? '');
  const [network, setNetwork] = useState<NetworkType>(wallet?.network ?? 'ethereum');
  const [isPrimary, setIsPrimary] = useState(wallet?.isPrimary ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (label.trim().length < 2) errs.label = 'Informe um nome para a carteira.';
    if (!/^0x[0-9a-fA-F.]{6,42}$/.test(address)) errs.address = 'Endereço inválido (deve começar com 0x).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    save.mutate(
      { id: wallet?.id, label, address, network, isPrimary },
      { onSuccess: onDone, onError: (err) => setError(errorMessage(err)) },
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border p-4">
      <h2 className="font-semibold">{wallet ? 'Editar carteira' : 'Nova carteira'}</h2>
      <Field id="w-label" label="Nome" value={label} onChange={(e) => setLabel(e.target.value)} error={errors.label} />
      <Field id="w-address" label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} />
      <label className="block text-sm font-medium" htmlFor="w-network">Rede</label>
      <select id="w-network" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={network} onChange={(e) => setNetwork(e.target.value as NetworkType)}>
        <option value="ethereum">Ethereum</option>
        <option value="polygon">Polygon</option>
        <option value="arbitrum">Arbitrum</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} /> Carteira principal
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>Salvar</Button>
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}

export function WalletsPage() {
  const { data: wallets, isLoading } = useWallets();
  const [editing, setEditing] = useState<Wallet | 'new' | null>(null);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carteiras</h1>
        {!editing && <Button onClick={() => setEditing('new')}>Adicionar carteira</Button>}
      </div>
      {editing && <WalletForm key={editing === 'new' ? 'new' : editing.id} wallet={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
      {isLoading ? <Skeleton className="h-32" /> : (
        <ul className="space-y-2">
          {wallets?.map((w) => (
            <li key={w.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">
                <p className="font-semibold">{w.label} {w.isPrimary ? <Badge tone="success">Principal</Badge> : <Badge>Secundária</Badge>}</p>
                <p className="text-muted-foreground">{w.address} · {w.network} · {w.balanceEth} ETH</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(w)}>Editar</Button>
            </li>
          ))}
          {wallets?.length === 0 && <li className="text-sm text-muted-foreground">Nenhuma carteira cadastrada.</li>}
        </ul>
      )}
    </div>
  );
}
