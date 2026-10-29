import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <header className="border-b border-border p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="font-bold text-xl tracking-tight">GreenMint</span>
          </div>
          <Button variant="outline" size="sm">Conectar Carteira</Button>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full p-4">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return (
      <div className="py-12 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Marketplace de NFTs GreenMint
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore, colecione e negocie NFTs exclusivos com liquidez e tempo real.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button>Explorar Coleção</Button>
          <Button variant="outline">Conhecer Mais</Button>
        </div>
      </div>
    )
  },
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
