import React, { useRef, useState } from 'react';
import {
  useChangePassword,
  useProfile,
  useSaveWallet,
  useUpdateProfile,
  useWallets,
} from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { User } from '@/types';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileFormView({ profile }: { profile: User }) {
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const saveWallet = useSaveWallet();
  const { data: wallets } = useWallets();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Primary wallet from user's wallets list
  const primaryWallet = wallets?.find((w) => w.isPrimary) || wallets?.[0];

  // Profile Fields
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [ensName, setEnsName] = useState(
    profile.username.includes('.eth') ? profile.username.replace('.eth', '') : profile.username,
  );
  const [walletLabelInput, setWalletLabelInput] = useState<string | null>(null);
  const walletLabel = walletLabelInput ?? primaryWallet?.label ?? 'Carteira Principal';
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || DEFAULT_AVATAR);
  const [bio] = useState(profile.bio ?? '');

  // Password Fields
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirmNext, setShowConfirmNext] = useState(false);

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [busy, setBusy] = useState(false);

  function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveAvatar() {
    setAvatarUrl(DEFAULT_AVATAR);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (name.trim().length < 2) {
      errs.name = 'Informe seu nome.';
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      errs.username = '3 a 20 caracteres: letras, números ou _.';
    }
    if (!emailRe.test(email.trim())) {
      errs.email = 'Informe um e-mail válido.';
    }
    if (walletLabel.trim().length < 2) {
      errs.walletLabel = 'Informe o apelido da carteira.';
    }

    const wantsPasswordChange = cur.length > 0 || next.length > 0 || confirmNext.length > 0;
    if (wantsPasswordChange) {
      if (!cur) {
        errs.cur = 'Informe a senha atual.';
      }
      if (next.length < 8) {
        errs.next = 'A nova senha deve ter ao menos 8 caracteres.';
      }
      if (confirmNext && confirmNext !== next) {
        errs.confirmNext = 'As senhas não coincidem.';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    setMsg(undefined);

    try {
      // 1. Update Profile (Name, Username, Email, Bio, Avatar)
      await updateProfile.mutateAsync({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        bio,
        avatarUrl,
      });

      // 2. Update Primary Wallet label if modified
      if (primaryWallet && walletLabel.trim() && walletLabel.trim() !== primaryWallet.label) {
        await saveWallet.mutateAsync({
          id: primaryWallet.id,
          address: primaryWallet.address,
          network: primaryWallet.network,
          label: walletLabel.trim(),
          isPrimary: primaryWallet.isPrimary,
        });
      }

      // 3. Update Password if requested
      if (wantsPasswordChange) {
        await changePassword.mutateAsync({
          currentPassword: cur,
          newPassword: next,
        });
        setCur('');
        setNext('');
        setConfirmNext('');
      }

      setMsg({ ok: true, text: 'Perfil atualizado.' });
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const isPending =
    busy || updateProfile.isPending || changePassword.isPending || saveWallet.isPending;

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {/* 2-Column Grid matching Figma's Perfil do colecionador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Nome de exibição * */}
          <div className="space-y-2">
            <label htmlFor="p-name" className="text-sm font-medium text-foreground">
              Nome de exibição <span className="text-destructive">*</span>
            </label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome de exibição"
              className={cn('h-11 font-mono text-sm', errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p role="alert" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* E-mail * */}
          <div className="space-y-2">
            <label htmlFor="p-email" className="text-sm font-medium text-foreground">
              E-mail <span className="text-destructive">*</span>
            </label>
            <Input
              id="p-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className={cn('h-11 font-mono text-sm', errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p role="alert" className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          {/* Apelido da carteira * */}
          <div className="space-y-2">
            <label htmlFor="p-wallet-label" className="text-sm font-medium text-foreground">
              Apelido da carteira <span className="text-destructive">*</span>
            </label>
            <Input
              id="p-wallet-label"
              value={walletLabel}
              onChange={(e) => setWalletLabelInput(e.target.value)}
              placeholder="Apelido da carteira"
              className={cn('h-11 font-mono text-sm', errors.walletLabel && 'border-destructive')}
            />
            {errors.walletLabel && (
              <p role="alert" className="text-xs text-destructive">
                {errors.walletLabel}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Nome de usuário * */}
          <div className="space-y-2">
            <label htmlFor="p-username" className="text-sm font-medium text-foreground">
              Nome de usuário <span className="text-destructive">*</span>
            </label>
            <Input
              id="p-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário"
              className={cn('h-11 font-mono text-sm', errors.username && 'border-destructive')}
            />
            {errors.username && (
              <p role="alert" className="text-xs text-destructive">
                {errors.username}
              </p>
            )}
          </div>

          {/* Nome ENS * (.eth) */}
          <div className="space-y-2">
            <label htmlFor="p-ens" className="text-sm font-medium text-foreground">
              Nome ENS <span className="text-destructive">*</span>
            </label>
            <div className="relative flex items-center">
              <Input
                id="p-ens"
                value={ensName}
                onChange={(e) => setEnsName(e.target.value)}
                placeholder="colecionador"
                className={cn('h-11 font-mono text-sm pr-14', errors.ens && 'border-destructive')}
              />
              <span className="pointer-events-none absolute right-3 select-none text-xs font-mono font-semibold text-muted-foreground">
                .eth
              </span>
            </div>
            {errors.ens && (
              <p role="alert" className="text-xs text-destructive">
                {errors.ens}
              </p>
            )}
          </div>

          {/* Avatar (Image + Alterar / Remover) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Avatar</label>
            <div className="flex items-center gap-4 pt-0.5">
              <img
                src={avatarUrl}
                alt="Avatar do colecionador"
                className="h-14 w-14 rounded-full object-cover border-2 border-border/80 shadow-inner"
              />
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Alterar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Remover
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileSelect}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alterar Senha Section */}
      <div className="border-t border-border/60 pt-8 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Alterar senha</h2>

        <div className="max-w-md space-y-4">
          {/* Senha atual */}
          <div className="space-y-2">
            <label htmlFor="cur" className="text-sm font-medium text-foreground">
              Senha atual
            </label>
            <div className="relative flex items-center">
              <Input
                id="cur"
                type={showCur ? 'text' : 'password'}
                autoComplete="current-password"
                value={cur}
                onChange={(e) => setCur(e.target.value)}
                placeholder="Senha atual"
                className={cn('h-11 font-mono text-sm pr-10', errors.cur && 'border-destructive')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCur(!showCur)}
                aria-label={showCur ? 'Ocultar senha atual' : 'Exibir senha atual'}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.cur && (
              <p role="alert" className="text-xs text-destructive">
                {errors.cur}
              </p>
            )}
          </div>

          {/* Nova senha */}
          <div className="space-y-2">
            <label htmlFor="next" className="text-sm font-medium text-foreground">
              Nova senha
            </label>
            <div className="relative flex items-center">
              <Input
                id="next"
                type={showNext ? 'text' : 'password'}
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Nova senha"
                className={cn('h-11 font-mono text-sm pr-10', errors.next && 'border-destructive')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNext(!showNext)}
                aria-label={showNext ? 'Ocultar nova senha' : 'Exibir nova senha'}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.next && (
              <p role="alert" className="text-xs text-destructive">
                {errors.next}
              </p>
            )}
          </div>

          {/* Confirmar nova senha */}
          <div className="space-y-2">
            <label htmlFor="confirm-next" className="text-sm font-medium text-foreground">
              Confirmar nova senha
            </label>
            <div className="relative flex items-center">
              <Input
                id="confirm-next"
                type={showConfirmNext ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmNext}
                onChange={(e) => setConfirmNext(e.target.value)}
                placeholder="Confirmar nova senha"
                className={cn(
                  'h-11 font-mono text-sm pr-10',
                  errors.confirmNext && 'border-destructive',
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmNext(!showConfirmNext)}
                aria-label={
                  showConfirmNext
                    ? 'Ocultar confirmação de nova senha'
                    : 'Exibir confirmação de nova senha'
                }
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirmNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmNext && (
              <p role="alert" className="text-xs text-destructive">
                {errors.confirmNext}
              </p>
            )}
          </div>

          {/* Feedback messages */}
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

          {/* Submit Button (Figma: Salvar, Test 8: Salvar alterações) */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="h-11 px-8 text-sm font-semibold"
            >
              Salvar <span className="sr-only">alterações</span>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
      <div className="border-t border-border/60 pt-8 space-y-4 max-w-md">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="mx-auto max-w-7xl min-h-[calc(100vh-14rem)] px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
        {/* Left Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <ProfileSidebar activeItem="profile" />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Perfil do colecionador
          </h1>

          {isLoading || !profile ? (
            <ProfileSkeleton />
          ) : (
            <ProfileFormView profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}
