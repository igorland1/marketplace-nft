import { Link, useNavigate } from '@tanstack/react-router';
import {
  User as UserIcon,
  Wallet as WalletIcon,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export type ProfileTab =
  | 'profile'
  | 'wallets'
  | 'activity'
  | 'wishlist'
  | 'offers'
  | 'downloads'
  | 'support';

interface ProfileSidebarProps {
  activeItem: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
}

export function ProfileSidebar({ activeItem, onTabChange }: ProfileSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: '/login' });
  }

  const navItems = [
    {
      id: 'profile' as const,
      label: 'Dados do perfil',
      icon: UserIcon,
      to: '/profile' as const,
    },
    {
      id: 'wallets' as const,
      label: 'Carteiras',
      icon: WalletIcon,
      to: '/wallets' as const,
    },
    {
      id: 'activity' as const,
      label: 'Atividade',
      icon: Activity,
    },
    {
      id: 'wishlist' as const,
      label: 'Lista de interesse',
      icon: Heart,
    },
    {
      id: 'offers' as const,
      label: 'Ofertas',
      icon: Tag,
    },
    {
      id: 'downloads' as const,
      label: 'Arquivos baixados',
      icon: Download,
    },
    {
      id: 'support' as const,
      label: 'Suporte',
      icon: HelpCircle,
    },
  ];

  return (
    <aside className="w-full rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
      <h2 className="px-3 pb-3 text-lg font-bold tracking-tight text-foreground md:text-xl">
        Meu perfil
      </h2>

      <nav aria-label="Navegação do perfil" className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          const content = (
            <>
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span className="truncate">{item.label}</span>
            </>
          );

          const className = cn(
            'group flex w-full items-center gap-3.5 px-3 py-2.5 text-xs md:text-sm font-medium transition-all duration-150 rounded-lg text-left',
            isActive
              ? 'border-l-4 border-primary bg-primary/10 pl-2.5 font-semibold text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          );

          if (item.to) {
            return (
              <Link key={item.id} to={item.to} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={className}
            >
              {content}
            </button>
          );
        })}

        <div className="my-2.5 border-t border-border/60" />

        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive md:text-sm"
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
          <span>Sair</span>
        </button>
      </nav>
    </aside>
  );
}
