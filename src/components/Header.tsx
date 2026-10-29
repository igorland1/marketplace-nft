import { Link, useNavigate } from '@tanstack/react-router';
import { Heart, Home, LogIn, LogOut, ShoppingCart, User as UserIcon, Wallet } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

const navLink = 'px-1 py-2 text-xs transition-colors hover:text-primary border-b-2 border-transparent';
const navActive = { className: 'text-primary border-primary' };

export function Header({ isLive }: { isLive: boolean }) {
  const { user, logout } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const count = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;
  const doLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold tracking-widest">
            KURIO
            <span
              title={isLive ? 'Atualizações em tempo real ativas' : 'Sem conexão em tempo real'}
              className={cn('hidden rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline', isLive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}
            >
              {isLive ? '● ao vivo' : '○ offline'}
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={navActive} className={navLink}>Início</Link>
            <Link to="/" hash="catalogo" className={navLink}>Mercado</Link>
            {['Criadores', 'Aprenda'].map((t) => (
              <span key={t} aria-disabled="true" title="Em breve" className={cn(navLink, 'cursor-not-allowed text-muted-foreground')}>{t}</span>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link to="/cart" aria-label={`Carrinho, ${count} itens`} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}>
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/wallets" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>Carteiras</Link>
                <Link to="/profile" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>
                  <UserIcon className="mr-1 h-4 w-4" aria-hidden /> {user.name.split(' ')[0]}
                </Link>
                <button onClick={doLogout} className={cn(buttonVariants({ size: 'sm' }), 'hidden md:inline-flex')}>
                  <LogOut className="mr-1 h-4 w-4" aria-hidden /> Sair
                </button>
              </>
            ) : (
              <Link to="/login" search={{}} className={cn(buttonVariants({ size: 'sm' }), 'hidden md:inline-flex')}>
                <LogIn className="mr-1 h-4 w-4" aria-hidden /> Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation (Figma mobile frames) */}
      <nav aria-label="Navegação móvel" className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card py-2 md:hidden">
        <Link to="/" aria-label="Início" className="p-2" activeOptions={{ exact: true }} activeProps={{ className: 'text-primary' }}><Home className="h-5 w-5" /></Link>
        <Link to="/profile" aria-label="Favoritos e perfil" className="p-2" activeProps={{ className: 'text-primary' }}><Heart className="h-5 w-5" /></Link>
        <Link to="/cart" aria-label="Carrinho" className="p-2" activeProps={{ className: 'text-primary' }}><ShoppingCart className="h-5 w-5" /></Link>
        <Link to="/wallets" aria-label="Carteiras" className="p-2" activeProps={{ className: 'text-primary' }}><Wallet className="h-5 w-5" /></Link>
        {user ? (
          <button onClick={doLogout} aria-label="Sair" className="p-2"><LogOut className="h-5 w-5" /></button>
        ) : (
          <Link to="/login" search={{}} aria-label="Entrar" className="p-2" activeProps={{ className: 'text-primary' }}><UserIcon className="h-5 w-5" /></Link>
        )}
      </nav>
    </>
  );
}
