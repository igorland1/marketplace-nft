import React, { useState } from 'react';
import { useProfile, useSaveWallet, useWallets } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { NetworkType, Wallet } from '@/types';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CheckCircle2 } from 'lucide-react';

export function WalletsPage() {
  const { data: wallets, isLoading } = useWallets();
  const { data: profile } = useProfile();
  const saveWallet = useSaveWallet();

  const primaryWallet = wallets?.find((w) => w.isPrimary) || wallets?.[0];
  const secondaryWallets = wallets?.filter((w) => w !== primaryWallet) || [];

  // Form state
  const [editingId, setEditingId] = useState<string | undefined>();
  const [isPrimaryWallet, setIsPrimaryWallet] = useState(false);

  // Field states matching Figma's Carteiras.pdf
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<NetworkType>('ethereum');
  const [displayName, setDisplayName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [walletType, setWalletType] = useState('MetaMask');
  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState('');
  const [ensName, setEnsName] = useState('');
  const [ensSecondary, setEnsSecondary] = useState('');

  // Secondary section state
  const [sameAsPrimary, setSameAsPrimary] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  function handleStartNew() {
    setEditingId(undefined);
    setIsPrimaryWallet(false);
    setLabel('');
    setAddress('');
    setNetwork('ethereum');
    setDisplayName(profile?.name || '');
    setProfileName(profile?.username || '');
    setEmail(profile?.email || '');
    setEnsName(profile?.username ? profile.username.replace('.eth', '') : '');
    setWalletType('MetaMask');
    setReferralCode('');
    setEnsSecondary('');
    setErrors({});
    setMsg(undefined);

    // Focus #w-label for immediate typing
    const el = document.getElementById('w-label');
    el?.focus();
  }

  function handleEdit(w: Wallet) {
    setEditingId(w.id);
    setIsPrimaryWallet(w.isPrimary);
    setLabel(w.label);
    setAddress(w.address);
    setNetwork(w.network);
    setDisplayName(profile?.name || '');
    setProfileName(profile?.username || '');
    setEmail(profile?.email || '');
    setEnsName(profile?.username ? profile.username.replace('.eth', '') : '');
    setErrors({});
    setMsg(undefined);

    const el = document.getElementById('w-label');
    el?.focus();
  }

  function handleCancel() {
    setEditingId(undefined);
    setLabel('');
    setAddress('');
    setErrors({});
  }

  function handleToggleSameAsPrimary(checked: boolean) {
    setSameAsPrimary(checked);
    if (checked && primaryWallet) {
      setLabel(`${primaryWallet.label} (Backup)`);
      setAddress(primaryWallet.address);
      setNetwork(primaryWallet.network);
      setIsPrimaryWallet(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (label.trim().length < 2) {
      errs.label = 'Informe um nome para a carteira.';
    }
    if (!/^0x[0-9a-fA-F.]{6,42}$/.test(address.trim())) {
      errs.address = 'Endereço inválido (deve começar com 0x).';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await saveWallet.mutateAsync({
        id: editingId,
        label: label.trim(),
        address: address.trim(),
        network,
        isPrimary: isPrimaryWallet,
      });

      setMsg({ ok: true, text: 'Carteira salva com sucesso.' });
      setEditingId(undefined);
      setLabel('');
      setAddress('');
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    }
  }

  return (
    <div className="mx-auto max-w-7xl min-h-[calc(100vh-14rem)] px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
        {/* Left Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <ProfileSidebar activeItem="wallets" />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-10">
          {/* Section 1: Carteira principal */}
          <section className="space-y-6">
            {/* Header: Title, Description, and Adicionar CTA */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  Carteira principal
                </h1>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleStartNew}
                className="shrink-0 gap-1.5 border-primary/40 font-semibold text-primary hover:bg-primary/10 text-xs md:text-sm h-9 md:h-10"
              >
                + Adicionar <span className="sr-only">carteira</span>
              </Button>
            </div>

            {/* Active Primary Wallet Pill (if already saved) */}
            {primaryWallet && !editingId && (
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Badge tone="success">Principal</Badge>
                    <span className="text-sm font-semibold text-foreground">
                      {primaryWallet.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {primaryWallet.address} · {primaryWallet.network} · {primaryWallet.balanceEth} ETH
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(primaryWallet)}
                  className="font-medium text-xs"
                >
                  Editar
                </Button>
              </div>
            )}

            {/* 2-Column Form Grid matching Figma's Carteiras.pdf */}
            <form onSubmit={submit} noValidate className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Nome de exibição * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-display-name" className="text-sm font-medium text-foreground">
                      Nome de exibição <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="w-display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nome de exibição"
                      className="h-11 font-mono text-sm"
                    />
                  </div>

                  {/* Rede * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-network" className="text-sm font-medium text-foreground">
                      Rede <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="w-network"
                      value={network}
                      onChange={(e) => setNetwork(e.target.value as NetworkType)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="arbitrum">Arbitrum</option>
                    </select>
                  </div>

                  {/* Endereço da carteira * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-address" className="text-sm font-medium text-foreground">
                      Endereço da carteira <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="w-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Endereço 0x da carteira"
                      className={cn(
                        'h-11 font-mono text-sm',
                        errors.address && 'border-destructive focus-visible:ring-destructive',
                      )}
                    />
                    {errors.address && (
                      <p role="alert" className="text-xs text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Tipo de carteira * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-wallet-type" className="text-sm font-medium text-foreground">
                      Tipo de carteira <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="w-wallet-type"
                      value={walletType}
                      onChange={(e) => setWalletType(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="MetaMask">MetaMask</option>
                      <option value="WalletConnect">WalletConnect</option>
                      <option value="Coinbase Wallet">Coinbase Wallet</option>
                      <option value="Ledger">Ledger</option>
                      <option value="Phantom">Phantom</option>
                    </select>
                  </div>

                  {/* E-mail * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-email" className="text-sm font-medium text-foreground">
                      E-mail <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="w-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail"
                      className="h-11 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Apelido da carteira * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-label" className="text-sm font-medium text-foreground">
                      Apelido da carteira <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="w-label"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Apelido da carteira"
                      className={cn(
                        'h-11 font-mono text-sm',
                        errors.label && 'border-destructive focus-visible:ring-destructive',
                      )}
                    />
                    {errors.label && (
                      <p role="alert" className="text-xs text-destructive">
                        {errors.label}
                      </p>
                    )}
                  </div>

                  {/* Nome do perfil * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-profile-name" className="text-sm font-medium text-foreground">
                      Nome do perfil <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="w-profile-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Nome do perfil"
                      className="h-11 font-mono text-sm"
                    />
                  </div>

                  {/* ENS ou carteira secundária (opcional) */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-ens-secondary" className="text-sm font-medium text-foreground">
                      ENS ou carteira secundária (opcional)
                    </label>
                    <Input
                      id="w-ens-secondary"
                      value={ensSecondary}
                      onChange={(e) => setEnsSecondary(e.target.value)}
                      placeholder="ENS ou carteira secundária (opcional)"
                      className="h-11 font-mono text-sm"
                    />
                  </div>

                  {/* Código de indicação * */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-referral" className="text-sm font-medium text-foreground">
                      Código de indicação <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="w-referral"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Código de indicação"
                      className="h-11 font-mono text-sm"
                    />
                  </div>

                  {/* Nome ENS * (.eth) */}
                  <div className="space-y-1.5">
                    <label htmlFor="w-ens" className="text-sm font-medium text-foreground">
                      Nome ENS <span className="text-destructive">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        id="w-ens"
                        value={ensName}
                        onChange={(e) => setEnsName(e.target.value)}
                        placeholder="colecionador"
                        className="h-11 font-mono text-sm pr-14"
                      />
                      <span className="pointer-events-none absolute right-3 select-none text-xs font-mono font-semibold text-muted-foreground">
                        .eth
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {msg && (
                <div
                  role={msg.ok ? 'status' : 'alert'}
                  className={cn(
                    'flex items-center gap-2 rounded-lg p-3 text-sm font-medium',
                    msg.ok
                      ? 'border border-primary/20 bg-primary/10 text-primary'
                      : 'border border-destructive/20 bg-destructive/10 text-destructive',
                  )}
                >
                  {msg.ok && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={saveWallet.isPending}
                  className="h-11 px-8 text-sm font-semibold"
                >
                  Salvar carteira
                </Button>

                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-11 px-4 text-sm font-semibold"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </section>

          {/* Section 2: Carteira secundária */}
          <section className="border-t border-border/60 pt-8 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Carteira secundária
              </h2>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sameAsPrimary}
                    onChange={(e) => handleToggleSameAsPrimary(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Igual à carteira principal</span>
                </label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStartNew}
                  className="gap-1 border-primary/40 font-semibold text-primary hover:bg-primary/10 text-xs md:text-sm h-8 md:h-9"
                >
                  + Adicionar
                </Button>
              </div>
            </div>

            {/* List of secondary wallets or empty state */}
            {isLoading ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : secondaryWallets.length === 0 ? (
              <p className="text-xs md:text-sm text-muted-foreground py-2">
                Você ainda não adicionou uma carteira secundária.
              </p>
            ) : (
              <ul className="space-y-3 pt-2">
                {secondaryWallets.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm"
                  >
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Badge>Secundária</Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {w.label}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {w.address} · {w.network} · {w.balanceEth} ETH
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(w)}
                      className="font-medium text-xs"
                    >
                      Editar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
