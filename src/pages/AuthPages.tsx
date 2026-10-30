import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorMessage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Mail, Lock, User, AtSign, Eye, EyeOff, X } from 'lucide-react';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeRedirect(r?: string) {
  return r && r.startsWith('/') && !r.startsWith('//') ? r : '/';
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function LoginPage() {
  const isMobile = useIsMobile();
  const { login } = useAuth();
  const search = useSearch({ from: '/login' });
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        navigate({ to: safeRedirect(search.redirect) });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!emailRe.test(email)) errs.email = 'Informe um e-mail válido.';
    if (!password) errs.password = 'Informe a senha.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      await login(email, password);
      navigate({ to: safeRedirect(search.redirect) });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSocialLogin(provider: string) {
    setBusy(true);
    setFormError(undefined);
    try {
      // Demo mock login as primary user
      await login('satoshi@greenmint.io', 'password123');
      navigate({ to: safeRedirect(search.redirect) });
    } catch (err) {
      setFormError(`Falha ao conectar com ${provider}: ${errorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  }

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    setNotice('Instruções de recuperação foram enviadas para o seu e-mail cadastrado.');
  }

  function handleClose() {
    navigate({ to: safeRedirect(search.redirect) });
  }

  /* Mobile Login Screen (Figma: Login.pdf) */
  if (isMobile) {
    return (
      <div className="flex min-h-[82vh] flex-col justify-between px-2 py-4">
        {/* Top Header & Logo */}
        <div className="space-y-8 pt-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-[#f5f1eb] font-mono">
            KURIO
          </h1>
          <h2 id="login-title" className="text-xl font-bold font-mono text-[#f5f1eb]">
            Entrar
          </h2>
        </div>

        {/* Notices */}
        <div className="space-y-2 pt-2">
          {search.expired && (
            <p role="status" className="rounded-xl bg-[#c38346]/10 border border-[#c38346]/30 p-2.5 text-center text-xs font-mono text-[#c38346]">
              Sua sessão expirou. Entre novamente para continuar.
            </p>
          )}

          {notice && (
            <p role="status" className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-center text-xs font-mono text-emerald-400">
              {notice}
            </p>
          )}

          {formError && (
            <p role="alert" className="rounded-xl bg-destructive/10 border border-destructive/30 p-2.5 text-center text-xs font-mono text-destructive">
              {formError}
            </p>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={submit} noValidate className="space-y-4 pt-3">
          {/* E-mail */}
          <div className="space-y-1">
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@email.com"
              className={cn(
                'h-12 rounded-xl border-[#38261e] bg-[#1a110d] px-4 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                errors.email && 'border-destructive'
              )}
            />
            {errors.email && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="***********"
                className={cn(
                  'h-12 rounded-xl border-[#c38346]/80 bg-[#1a110d] pl-4 pr-12 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                  errors.password && 'border-destructive'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="absolute right-4 text-[#cbb89d]/75 hover:text-[#f5f1eb] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Esqueceu a senha? */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              tabIndex={0}
              onClick={handleForgotPassword}
              className="text-xs font-mono text-[#c38346] hover:underline transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Entrar Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 py-3.5 rounded-2xl bg-[#c38346] text-[#140d0a] font-mono text-base font-bold tracking-wide hover:bg-[#d49253] active:scale-98 transition-all shadow-md text-center block"
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* Divider: Ou continue com */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#38261e]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#140d0a] px-3 font-mono text-xs text-[#cbb89d]/75">
              Ou continue com
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            disabled={busy}
            className="flex w-full h-12 items-center justify-center gap-3 rounded-xl border border-[#38261e] bg-[#1a110d] font-mono text-xs font-medium text-[#f5f1eb] hover:bg-[#251813] active:scale-98 transition-all"
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={busy}
            className="flex w-full h-12 items-center justify-center gap-3 rounded-xl border border-[#38261e] bg-[#1a110d] font-mono text-xs font-medium text-[#f5f1eb] hover:bg-[#251813] active:scale-98 transition-all"
          >
            <FacebookIcon />
            <span>Continuar com Facebook</span>
          </button>
        </div>

        {/* Bottom Link: Novo na Kurio? Crie uma conta */}
        <div className="pt-8 pb-4 text-center">
          <p className="font-mono text-xs text-[#cbb89d]/75">
            Novo na Kurio?{' '}
            <Link
              to="/register"
              search={search.redirect ? { redirect: search.redirect } : undefined}
              className="font-bold text-[#f5f1eb] hover:underline transition-colors"
            >
              Crie uma conta
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-[460px] rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-5">
        {/* Close Button 'X' */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar modal"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Tab Switcher: Entrar | Criar conta (Figma style) */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <button
            type="button"
            id="login-title"
            className="text-lg font-bold text-foreground border-b-2 border-primary pb-1 px-1 transition-all"
          >
            Entrar
          </button>
          <Link
            to="/register"
            search={search.redirect ? { redirect: search.redirect } : undefined}
            className="text-lg font-medium text-muted-foreground hover:text-foreground pb-1 px-1 transition-all"
          >
            Criar conta
          </Link>
        </div>

        {/* Subtitle (Figma: Entre para gerenciar sua carteira, coleção e perfil de criador.) */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground max-w-xs mx-auto">
          Entre para gerenciar sua carteira, coleção e perfil de criador.
        </p>

        {/* Expired Session Notice */}
        {search.expired && (
          <p role="status" className="rounded-lg bg-primary/10 p-2 text-center text-xs text-primary font-medium">
            Sua sessão expirou. Entre novamente para continuar.
          </p>
        )}

        {/* Reset Notice */}
        {notice && (
          <p role="status" className="rounded-lg bg-emerald-500/10 p-2 text-center text-xs text-emerald-400 font-medium">
            {notice}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={submit} noValidate className="space-y-4">
          {/* E-mail Input with Left Icon */}
          <div className="space-y-1">
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@email.com"
                className={cn('pl-10 h-11 text-xs font-mono', errors.email && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            {errors.email && (
              <p role="alert" className="text-[11px] text-destructive pl-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input with Left Icon & Visibility Toggle */}
          <div className="space-y-1">
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••"
                className={cn('pl-10 pr-10 h-11 text-xs font-mono', errors.password && 'border-destructive focus-visible:ring-destructive')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="text-[11px] text-destructive pl-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Esqueceu a senha? Link (Figma: top 642 left 1121) */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              tabIndex={0}
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Error Message */}
          {formError && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-center text-xs text-destructive">
              {formError}
            </p>
          )}

          {/* Submit Button (Figma: Entrar) */}
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        {/* Divider: Ou continue com (Figma style) */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-[11px] text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        {/* Social Buttons: Google & Facebook */}
        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin('Google')}
            disabled={busy}
            className="w-full h-11 text-xs font-medium border-border/80 bg-background/50 hover:bg-background/90 gap-2.5"
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={busy}
            className="w-full h-11 text-xs font-medium border-border/80 bg-background/50 hover:bg-background/90 gap-2.5"
          >
            <FacebookIcon />
            <span>Continuar com Facebook</span>
          </Button>
        </div>

        {/* Demo Credentials Hint */}
        <p className="pt-1 text-center text-[11px] text-muted-foreground/70">
          Demo: <span className="font-mono text-foreground">satoshi@greenmint.io</span> / <span className="font-mono text-foreground">password123</span>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const isMobile = useIsMobile();
  const { register, login } = useAuth();
  const search = useSearch({ from: '/register' });
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  // Close modal on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        navigate({ to: safeRedirect(search.redirect) });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const finalName = f.name.trim() || f.username.trim() || 'Novo Colecionador';

    if (f.name.trim().length > 0 && f.name.trim().length < 2) {
      errs.name = 'Informe seu nome completo.';
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(f.username.trim())) {
      errs.username = '3 a 20 caracteres: letras, números ou _.';
    }
    if (!emailRe.test(f.email.trim())) {
      errs.email = 'Informe um e-mail válido.';
    }
    if (f.password.length < 8) {
      errs.password = 'A senha deve ter ao menos 8 caracteres.';
    }
    if (f.confirmPassword && f.confirmPassword !== f.password) {
      errs.confirmPassword = 'As senhas não coincidem.';
    }

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setFormError(undefined);
    try {
      await register({
        name: finalName,
        username: f.username.trim(),
        email: f.email.trim(),
        password: f.password,
      });
      navigate({ to: safeRedirect(search.redirect) });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSocialLogin(provider: string) {
    setBusy(true);
    setFormError(undefined);
    try {
      // Demo mock login
      await login('satoshi@greenmint.io', 'password123');
      navigate({ to: safeRedirect(search.redirect) });
    } catch (err) {
      setFormError(`Falha ao conectar com ${provider}: ${errorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  }

  function handleClose() {
    navigate({ to: safeRedirect(search.redirect) });
  }

  /* Mobile Register Screen (Figma: Cadastro.pdf) */
  if (isMobile) {
    return (
      <div className="flex min-h-[85vh] flex-col justify-between px-2 py-4">
        {/* Top Header & Logo */}
        <div className="space-y-6 pt-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-[#f5f1eb] font-mono">
            KURIO
          </h1>
          <h2 id="register-title" className="text-base font-bold font-mono text-[#f5f1eb]">
            Criar perfil de colecionador
          </h2>
        </div>

        {/* Notices */}
        {formError && (
          <div className="pt-2">
            <p role="alert" className="rounded-xl bg-destructive/10 border border-destructive/30 p-2.5 text-center text-xs font-mono text-destructive">
              {formError}
            </p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={submit} noValidate className="space-y-3 pt-3">
          {/* Nome completo */}
          <div className="space-y-1">
            <label htmlFor="name" className="sr-only">
              Nome completo
            </label>
            <Input
              id="name"
              value={f.name}
              onChange={set('name')}
              placeholder="Nome completo"
              className={cn(
                'h-11 rounded-xl border-[#38261e] bg-[#1a110d] px-4 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                errors.name && 'border-destructive'
              )}
            />
            {errors.name && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Nome de usuário */}
          <div className="space-y-1">
            <label htmlFor="username" className="sr-only">
              Nome de usuário
            </label>
            <Input
              id="username"
              value={f.username}
              onChange={set('username')}
              placeholder="Nome de usuário"
              className={cn(
                'h-11 rounded-xl border-[#38261e] bg-[#1a110d] px-4 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                errors.username && 'border-destructive'
              )}
            />
            {errors.username && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Digite seu e-mail */}
          <div className="space-y-1">
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={f.email}
              onChange={set('email')}
              placeholder="Digite seu e-mail"
              className={cn(
                'h-11 rounded-xl border-[#38261e] bg-[#1a110d] px-4 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                errors.email && 'border-destructive'
              )}
            />
            {errors.email && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={f.password}
                onChange={set('password')}
                placeholder="Senha"
                className={cn(
                  'h-11 rounded-xl border-[#38261e] bg-[#1a110d] pl-4 pr-12 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                  errors.password && 'border-destructive'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="absolute right-4 text-[#cbb89d]/75 hover:text-[#f5f1eb] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="sr-only">
              Confirmar senha
            </label>
            <div className="relative flex items-center">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={f.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Confirmar senha"
                className={cn(
                  'h-11 rounded-xl border-[#38261e] bg-[#1a110d] pl-4 pr-12 text-xs font-mono text-[#f5f1eb] placeholder:text-[#cbb89d]/50 focus:border-[#c38346]',
                  errors.confirmPassword && 'border-destructive'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                className="absolute right-4 text-[#cbb89d]/75 hover:text-[#f5f1eb] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p role="alert" className="text-[11px] font-mono text-destructive pl-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Criar perfil Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 py-3 rounded-2xl bg-[#c38346] text-[#140d0a] font-mono text-base font-bold tracking-wide hover:bg-[#d49253] active:scale-98 transition-all shadow-md text-center block mt-2"
          >
            {busy ? 'Criando…' : 'Criar perfil'}
          </button>
        </form>

        {/* Divider: Ou continue com */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#38261e]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#140d0a] px-3 font-mono text-xs text-[#cbb89d]/75">
              Ou continue com
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            disabled={busy}
            className="flex w-full h-11 items-center justify-center gap-3 rounded-xl border border-[#38261e] bg-[#1a110d] font-mono text-xs font-medium text-[#f5f1eb] hover:bg-[#251813] active:scale-98 transition-all"
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={busy}
            className="flex w-full h-11 items-center justify-center gap-3 rounded-xl border border-[#38261e] bg-[#1a110d] font-mono text-xs font-medium text-[#f5f1eb] hover:bg-[#251813] active:scale-98 transition-all"
          >
            <FacebookIcon />
            <span>Continuar com Facebook</span>
          </button>
        </div>

        {/* Bottom Link: Já tem uma conta? Entre */}
        <div className="pt-6 pb-2 text-center">
          <p className="font-mono text-xs text-[#cbb89d]/75">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              search={search.redirect ? { redirect: search.redirect } : undefined}
              className="font-bold text-[#f5f1eb] hover:underline transition-colors"
            >
              Entre
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-[460px] rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-5">
        {/* Close Button 'X' */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar modal"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Tab Switcher: Entrar | Criar conta (Figma: Criar conta is active) */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <Link
            to="/login"
            search={search.redirect ? { redirect: search.redirect } : {}}
            className="text-lg font-medium text-muted-foreground hover:text-foreground pb-1 px-1 transition-all"
          >
            Entrar
          </Link>
          <button
            type="button"
            id="register-title"
            className="text-lg font-bold text-foreground border-b-2 border-primary pb-1 px-1 transition-all"
          >
            Criar conta
          </button>
        </div>

        {/* Subtitle (Figma: Crie seu perfil de colecionador e conecte uma carteira quando quiser.) */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground max-w-xs mx-auto">
          Crie seu perfil de colecionador e conecte uma carteira quando quiser.
        </p>

        {/* Register Form */}
        <form onSubmit={submit} noValidate className="space-y-3.5">
          {/* Nome completo (Required for E2E tests and user profile) */}
          <div className="space-y-1">
            <label htmlFor="name" className="sr-only">
              Nome completo
            </label>
            <div className="relative flex items-center">
              <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="name"
                value={f.name}
                onChange={set('name')}
                placeholder="Nome completo"
                className={cn('pl-10 h-10 text-xs', errors.name && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            {errors.name && <p role="alert" className="text-[11px] text-destructive pl-1">{errors.name}</p>}
          </div>

          {/* Nome de usuário (Figma: top 501 left 849) */}
          <div className="space-y-1">
            <label htmlFor="username" className="sr-only">
              Nome de usuário
            </label>
            <div className="relative flex items-center">
              <AtSign className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="username"
                value={f.username}
                onChange={set('username')}
                placeholder="Nome de usuário"
                className={cn('pl-10 h-10 text-xs font-mono', errors.username && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            {errors.username && <p role="alert" className="text-[11px] text-destructive pl-1">{errors.username}</p>}
          </div>

          {/* Digite seu e-mail (Figma: top 579 left 849) */}
          <div className="space-y-1">
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={f.email}
                onChange={set('email')}
                placeholder="Digite seu e-mail"
                className={cn('pl-10 h-10 text-xs font-mono', errors.email && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            {errors.email && <p role="alert" className="text-[11px] text-destructive pl-1">{errors.email}</p>}
          </div>

          {/* Senha (Figma: top 657 left 849) */}
          <div className="space-y-1">
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={f.password}
                onChange={set('password')}
                placeholder="Senha"
                className={cn('pl-10 pr-10 h-10 text-xs font-mono', errors.password && 'border-destructive focus-visible:ring-destructive')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p role="alert" className="text-[11px] text-destructive pl-1">{errors.password}</p>}
          </div>

          {/* Confirmar senha (Figma: top 735 left 849) */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="sr-only">
              Confirmar senha
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={f.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Confirmar senha"
                className={cn('pl-10 pr-10 h-10 text-xs font-mono', errors.confirmPassword && 'border-destructive focus-visible:ring-destructive')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p role="alert" className="text-[11px] text-destructive pl-1">{errors.confirmPassword}</p>}
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-center text-xs text-destructive">
              {formError}
            </p>
          )}

          {/* Submit CTA Button (Figma: Criar conta) */}
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          >
            {busy ? 'Criando…' : 'Criar conta'}
          </Button>
        </form>

        {/* Divider: Ou continue com (Figma style) */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-[11px] text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        {/* Social Buttons: Google & Facebook */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin('Google')}
            disabled={busy}
            className="w-full h-10 text-xs font-medium border-border/80 bg-background/50 hover:bg-background/90 gap-2.5"
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={busy}
            className="w-full h-10 text-xs font-medium border-border/80 bg-background/50 hover:bg-background/90 gap-2.5"
          >
            <FacebookIcon />
            <span>Continuar com Facebook</span>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-1">
          Já tem conta?{' '}
          <Link
            to="/login"
            search={search.redirect ? { redirect: search.redirect } : {}}
            className="text-primary hover:underline font-semibold"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
