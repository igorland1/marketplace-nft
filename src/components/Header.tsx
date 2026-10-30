import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { LogIn, LogOut, Search, ShoppingCart, User as UserIcon, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const navLink = 'px-1 py-2 text-xs transition-colors hover:text-primary border-b-2 border-transparent';
const navActive = { className: 'text-primary border-primary' };

export function Header({ isLive }: { isLive: boolean }) {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const count = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;

  const isNFTDetail = location.pathname.startsWith('/nft/');
  const isCart = location.pathname === '/cart';
  const isAuth = location.pathname === '/login' || location.pathname === '/register';
  const isCheckout = location.pathname === '/checkout';
  const isCustomMobileScreen = isNFTDetail || isCart || isAuth || isCheckout;

  const currentPath = location.pathname + (location.searchStr ?? '');
  const loginSearch =
    location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register'
      ? { redirect: currentPath }
      : {};

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

  const handleScrollToFilters = () => {
    const el = document.getElementById('filtros');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={isMobile ? (isCustomMobileScreen ? 'hidden' : 'border-b-0') : 'border-b border-border'}>
        {/* Hidden data attribute for realtime status verification without visual disruption */}
        <div data-live={isLive ? 'true' : 'false'} className="hidden" aria-hidden="true" />

        {isMobile ? (
          /* Mobile Header (Figma: Início.pdf) */
          !isCustomMobileScreen && (
            <div className="flex w-full items-center gap-2.5 px-4 py-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#cbb89d]/75" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Buscar NFTs"
                  placeholder="Explorar coleções"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-[45px] w-full rounded-[14px] border border-[#38261e] bg-[#1e1512] pl-10 pr-4 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/75 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                aria-label="Abrir filtros"
                onClick={handleScrollToFilters}
                className="flex h-[45px] w-[45px] shrink-0 items-center justify-center p-0 rounded-[14px] overflow-hidden active:scale-95 transition-all shadow-sm focus:outline-none"
              >
                {/* Custom SVG filter matching Figma Frame 402.svg */}
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
                  <rect width="45" height="45" rx="14" fill="url(#paint0_linear_70410_4122)" />
                  <path d="M22.215 28.3925H16.2819" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A" />
                  <path d="M25.9379 28.3934C25.9379 30.2651 26.562 30.8884 28.4328 30.8884C30.3037 30.8884 30.9278 30.2651 30.9278 28.3934C30.9278 26.5218 30.3037 25.8984 28.4328 25.8984C26.562 25.8984 25.9379 26.5218 25.9379 28.3934Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A" />
                  <path d="M24.9952 18.7778H30.9275" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A" />
                  <path d="M21.2723 18.7767C21.2723 16.9059 20.6482 16.2817 18.7773 16.2817C16.9057 16.2817 16.2816 16.9059 16.2816 18.7767C16.2816 20.6484 16.9057 21.2717 18.7773 21.2717C20.6482 21.2717 21.2723 20.6484 21.2723 18.7767Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A" />
                  <defs>
                    <linearGradient id="paint0_linear_70410_4122" x1="-9" y1="-13" x2="45" y2="45" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#D28A4C" stopOpacity="0.45" />
                      <stop offset="1" stopColor="#D28A4C" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>
          )
        ) : (
          /* Desktop Header */
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
            <Link to="/" className="text-sm font-bold tracking-widest text-foreground hover:text-primary transition-colors">
              KURIO
            </Link>

            <nav aria-label="Principal" className="flex items-center gap-8">
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
                  <Link to="/wallets" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>Carteiras</Link>
                  <Link to="/profile" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                    <UserIcon className="mr-1 h-4 w-4" aria-hidden /> {user.name.split(' ')[0]}
                  </Link>
                  <button onClick={doLogout} className={cn(buttonVariants({ size: 'sm' }))}>
                    <LogOut className="mr-1 h-4 w-4" aria-hidden /> Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  search={loginSearch}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden /> Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation (Figma: Início.pdf curved notch bar) */}
      {isMobile && !isCustomMobileScreen && (
        <nav
          aria-label="Navegação móvel"
          className="fixed inset-x-0 bottom-0 z-50 h-[70px] select-none md:hidden"
        >
          {/* Curved dark bar background with center cutout notch */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[75px] w-full drop-shadow-2xl"
            viewBox="0 0 390 75"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="
                M 16 20
                Q 0 20 0 36
                L 0 75
                L 390 75
                L 390 36
                Q 390 20 374 20
                L 238 20
                C 222 20 220 56 195 56
                C 170 56 168 20 152 20
                Z
              "
              fill="#291c19"
            />
          </svg>

          {/* Elevated Center FAB (Figma: Ellipse 39.svg + Group.svg) */}
          <Link
            to="/wallets"
            aria-label="Carteiras"
            className="absolute left-1/2 -top-2.5 z-20 flex h-[65px] w-[65px] -translate-x-1/2 items-center justify-center rounded-full active:scale-95 transition-transform shadow-lg focus:outline-none"
          >
            {/* Ellipse 39 background */}
            <svg
              width="65"
              height="65"
              viewBox="0 0 65 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <circle cx="32.5" cy="32.5" r="32.5" fill="url(#fab_paint0_linear_15_5507)" />
              <defs>
                <linearGradient id="fab_paint0_linear_15_5507" x1="33" y1="-11" x2="33" y2="71" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D28A4C" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#D28A4C" />
                </linearGradient>
              </defs>
            </svg>

            {/* Group.svg icon */}
            <svg
              width="27"
              height="24"
              viewBox="0 0 27 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
              aria-hidden="true"
            >
              <path d="M13.3819 12.8913C9.28498 12.8913 5.18803 12.8913 1.09108 12.8906C0.961448 12.8906 0.827342 12.8943 0.702176 12.8667C0.25441 12.7684 -0.0480741 12.337 0.00631347 11.893C0.060701 11.4482 0.439924 11.1114 0.913021 11.1092C1.98364 11.1032 3.055 11.1062 4.12561 11.1062C11.3234 11.1062 18.5212 11.107 25.719 11.1084C25.8575 11.1084 26.0013 11.1047 26.1347 11.136C26.5743 11.2396 26.8641 11.6553 26.8179 12.0919C26.7702 12.5389 26.3947 12.8868 25.9246 12.8891C24.7139 12.8965 23.504 12.8928 22.2933 12.8928C19.3228 12.8928 16.3524 12.8928 13.3827 12.8928C13.3819 12.8928 13.3819 12.8921 13.3819 12.8913Z" fill="#F5F1EB" />
              <path d="M10.5553 24.0002C9.20453 23.7976 7.81951 23.7216 6.51123 23.3654C3.76503 22.6167 2.19524 20.7243 1.7445 17.9274C1.57761 16.8926 1.47479 15.8473 1.35559 14.8057C1.28332 14.1762 1.58357 13.7634 2.13191 13.6956C2.67653 13.6286 3.07587 13.9817 3.13622 14.5278C3.26586 15.708 3.35601 16.8978 3.57877 18.0615C3.98109 20.1633 5.70212 21.6288 7.83664 21.8165C8.84617 21.9052 9.8542 22.0177 10.8607 22.1339C11.5953 22.2188 11.9343 23.0347 11.4948 23.6314C11.3048 23.89 11.0805 23.9637 10.5553 24.0002Z" fill="#F5F1EB" />
              <path d="M25.4463 9.39819C25.4307 9.53528 25.4321 9.67758 25.3949 9.8087C25.3077 10.1186 25.0015 10.3779 24.7422 10.3831C24.3004 10.3921 23.7998 10.0643 23.6977 9.65001C23.6247 9.35572 23.6225 9.0443 23.5822 8.74107C23.4571 7.78444 23.3967 6.81366 23.1881 5.87566C22.7604 3.95571 21.5326 2.73758 19.6142 2.32259C18.4743 2.07599 17.2971 1.99999 16.1363 1.84726C16.0075 1.83013 15.8756 1.82417 15.7504 1.79213C15.331 1.68559 15.0583 1.287 15.1112 0.870521C15.17 0.407854 15.5269 0.0539627 15.9732 0.0859992C17.5042 0.195519 19.0427 0.30653 20.5119 0.776646C22.8633 1.52988 24.3451 3.15778 24.9054 5.53965C25.2012 6.79876 25.3018 8.10332 25.4903 9.38701C25.4761 9.39148 25.4612 9.39446 25.4463 9.39819Z" fill="#F5F1EB" />
              <path d="M25.4224 14.8807C25.2988 16.1673 25.2086 17.5807 24.8167 18.9441C24.0777 21.5145 21.8962 23.2891 19.2372 23.5491C18.1554 23.6549 17.0781 23.8106 15.9992 23.944C15.617 23.9917 15.2013 23.6229 15.1208 23.1647C15.0404 22.7058 15.3287 22.255 15.7832 22.1939C16.3263 22.1202 16.8776 22.106 17.4208 22.033C18.3223 21.913 19.2565 21.8803 20.1133 21.6083C21.97 21.0197 23.007 19.6638 23.279 17.7453C23.4235 16.7254 23.5308 15.7002 23.6336 14.675C23.6932 14.082 24.0799 13.6685 24.6007 13.6983C25.1043 13.7273 25.4515 14.1744 25.4224 14.8807Z" fill="#F5F1EB" />
              <path d="M1.3295 9.27513C1.52768 7.95493 1.62081 6.60791 1.9449 5.319C2.60053 2.71063 4.34912 1.11849 6.95898 0.532893C8.1339 0.269151 9.34756 0.177512 10.5448 0.0173291C10.7266 -0.00725703 10.9226 -0.0087471 11.0984 0.0329749C11.5119 0.130574 11.7548 0.509797 11.7153 0.940427C11.6736 1.39117 11.3681 1.69068 10.9285 1.73985C9.84748 1.86055 8.7642 1.97081 7.68688 2.1228C5.4108 2.44316 3.83356 4.02338 3.52363 6.28456C3.37536 7.36933 3.2569 8.45857 3.1295 9.54632C3.07809 9.98441 2.70185 10.3122 2.24217 10.3063C1.79589 10.3003 1.41518 9.94492 1.39059 9.50833C1.38612 9.43457 1.38985 9.36007 1.38985 9.28556C1.36973 9.28184 1.34961 9.27886 1.3295 9.27513Z" fill="#F5F1EB" />
            </svg>
          </Link>

          {/* 4 Navigation Icons Row */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex h-[55px] items-center justify-around px-2">
            {/* Home */}
            <Link
              to="/"
              aria-label="Início"
              className="flex h-11 w-11 items-center justify-center transition-colors"
              activeOptions={{ exact: true }}
              activeProps={{ className: 'text-[#d28a4c]' }}
              inactiveProps={{ className: 'text-[#c8b79f]' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </Link>

            {/* Favorites / Profile */}
            <Link
              to="/profile"
              aria-label="Favoritos e perfil"
              className="flex h-11 w-11 items-center justify-center transition-colors"
              activeProps={{ className: 'text-[#d28a4c]' }}
              inactiveProps={{ className: 'text-[#c8b79f]' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Link>

            {/* Spacer for center FAB */}
            <div className="w-[65px]" aria-hidden="true" />

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Carrinho, ${count} itens`}
              className="relative flex h-11 w-11 items-center justify-center transition-colors"
              activeProps={{ className: 'text-[#d28a4c]' }}
              inactiveProps={{ className: 'text-[#c8b79f]' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d28a4c] px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            {/* User Profile / Logout */}
            {user ? (
              <button
                onClick={doLogout}
                aria-label="Sair"
                className="flex h-11 w-11 items-center justify-center text-[#c8b79f] hover:text-[#d28a4c] transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>
            ) : (
              <Link
                to="/login"
                search={loginSearch}
                aria-label="Entrar"
                className="flex h-11 w-11 items-center justify-center transition-colors"
                activeProps={{ className: 'text-[#d28a4c]' }}
                inactiveProps={{ className: 'text-[#c8b79f]' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
