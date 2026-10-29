import { cn } from '@/lib/utils';

export function Badge({
  className,
  tone = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'default' | 'success' | 'danger' | 'warning' }) {
  const tones = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-500/10 text-emerald-600',
    danger: 'bg-red-500/10 text-red-600',
    warning: 'bg-amber-500/10 text-amber-600',
  };
  return (
    <span
      className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}
