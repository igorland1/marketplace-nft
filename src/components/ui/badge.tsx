import { cn } from '@/lib/utils';

export function Badge({
  className,
  tone = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'default' | 'success' | 'danger' | 'warning' }) {
  const tones = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-primary/10 text-primary',
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-primary/10 text-primary',
  };
  return (
    <span
      className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}
