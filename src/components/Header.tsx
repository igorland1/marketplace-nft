import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Heart, Home, LogIn, LogOut, Search, ShoppingCart, User as UserIcon, Wallet, X } from 'lucide-react';
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
  const location = useLocation();
  const count = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;

  const urlQ = ((location.search as Record<string, unknown>)?.q as string) || '';
  const [isSearchOpenExplicit, setIsSearchOpenExplicit] = useState(false);
  const [localQuery, setLocalQuery] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSearchOpen = isSearchOpenExplicit || Boolean(urlQ);
  const query = localQuery !== null ? localQuery : urlQ;

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (val: string) => {
    setLocalQuery(val);
    navigate({
      to: '/',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        q: val.trim() || undefined,
        page: undefined,
      }),
    });
  };

  const handleCloseSearch = () => {
    setIsSearchOpenExplicit(false);
    setLocalQuery(null);
    if (urlQ) {
      navigate({
        to: '/',
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          q: undefined,
          page: undefined,
        }),
      });
    }
  };

  const doLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  return (
    <>
      <header className="border-b border-border">
        {/* Hidden data attribute for realtime status verification without visual disruption */}
        <div data-live={isLive ? 'true' : 'false'} className="hidden" aria-hidden="true" />

        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-sm font-bold tracking-widest text-foreground hover:text-primary transition-colors">
            KURIO
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={navActive} className={navLink}>Início</Link>
            <Link to="/" hash="catalogo" className={navLink}>Mercado</Link>
            {['Criadores', 'Aprenda'].map((t) => (
              <span key={t} aria-disabled="true" title="Em breve" className={cn(navLink, 'cursor-not-allowed text-muted-foreground')}>{t}</span>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search icon / expandable search bar */}
            {isSearchOpen ? (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden />
                <input
                  ref={searchInputRef}
                  type="text"
                  aria-label="Buscar NFTs"
                  placeholder="Buscar NFTs..."
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCloseSearch();
                  }}
                  className="h-8 w-44 rounded-md border border-primary/60 bg-card pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none md:w-60"
                />
                <button
                  type="button"
                  onClick={handleCloseSearch}
                  aria-label="Fechar busca"
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpenExplicit(true)}
                aria-label="Abrir busca"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                <Search className="h-4 w-4" aria-hidden />
              </button>
            )}

            {/* Cart Button */}
            <Link to="/cart" aria-label={`Carrinho, ${count} itens`} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative h-8 w-8')}>
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </Link>

            {/* Auth Buttons */}
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
              <Link
                to="/login"
                search={{}}
                className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors md:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden /> Entrar
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
