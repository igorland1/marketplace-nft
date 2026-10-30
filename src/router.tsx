/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, createRoute, createRouter, Link, Outlet, redirect } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRealtimeSocket } from '@/hooks/useRealtimeSocket';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { buttonVariants } from '@/components/ui/button';
import { HomePage, validateCatalogSearch } from '@/pages/HomePage';
import { NFTDetailPage } from '@/pages/NFTDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderPage } from '@/pages/OrderPage';
import { LoginPage, RegisterPage } from '@/pages/AuthPages';
import { ProfilePage } from '@/pages/ProfilePage';
import { WalletsPage } from '@/pages/WalletsPage';

function RootLayout() {
  const { isConnected } = useRealtimeSocket();
  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <Header isLive={isConnected} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-16 text-center space-y-3">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <Link to="/" className={buttonVariants()}>Ir para o início</Link>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound,
});

// Private flows: redirect to login keeping the way back
const requireAuth = ({ location }: { location: { pathname: string; search: unknown; searchStr?: string } }) => {
  if (!localStorage.getItem('greenmint_auth_token')) {
    throw redirect({ to: '/login', search: { redirect: location.pathname + (location.searchStr ?? '') } });
  }
};

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage, validateSearch: validateCatalogSearch });
const nftRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$id', component: NFTDetailPage });
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: CartPage });
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: CheckoutPage, beforeLoad: requireAuth });
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orders/$id', component: OrderPage, beforeLoad: requireAuth });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage, beforeLoad: requireAuth });
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', component: WalletsPage, beforeLoad: requireAuth });
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
  }),
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>): { redirect?: string; expired?: boolean } => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
    expired: s.expired === 1 || s.expired === '1' || s.expired === true ? true : undefined,
  }),
});

const routeTree = rootRoute.addChildren([
  indexRoute, nftRoute, cartRoute, checkoutRoute, orderRoute, profileRoute, walletsRoute, registerRoute, loginRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
