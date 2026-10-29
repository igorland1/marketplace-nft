import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';

export function Header({ isLive }: { isLive: boolean }) {
  const { user, logout } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const count = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 p-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white">G</span>
          <span className="text-xl font-bold tracking-tight">GreenMint</span>
          <span
            className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${isLive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
          >
            {isLive ? '● Ao vivo' : '○ Offline'}
          </span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1">
          <Link to="/cart" aria-label={`Carrinho, ${count} itens`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              <ShoppingCart className="mr-1 h-4 w-4" aria-hidden /> {count}
            </Link>
          {user ? (
            <>
              <Link to="/wallets" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Carteiras</Link>
              <Link to="/profile" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  <UserIcon className="mr-1 h-4 w-4" aria-hidden /> {user.name.split(' ')[0]}
                </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate({ to: '/' });
                }}
              >
                <LogOut className="mr-1 h-4 w-4" aria-hidden /> Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" search={{}} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Entrar</Link>
              <Link to="/register" className={buttonVariants({ size: 'sm' })}>Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
