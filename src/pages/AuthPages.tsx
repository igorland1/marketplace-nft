import { useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { errorMessage } from '@/lib/format';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeRedirect(r?: string) {
  return r && r.startsWith('/') && !r.startsWith('//') ? r : '/';
}

export function LoginPage() {
  const { login } = useAuth();
  const search = useSearch({ from: '/login' });
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

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

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-sm space-y-4 py-10">
      <h1 className="text-2xl font-bold">Entrar</h1>
      {search.expired && <p role="status" className="rounded bg-primary/10 p-2 text-sm text-primary">Sua sessão expirou. Entre novamente para continuar.</p>}
      <Field id="email" label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <Field id="password" label="Senha" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button>
      <p className="text-sm text-muted-foreground">
        Demo: satoshi@greenmint.io / password123 · <Link to="/register" className="underline">Criar conta</Link>
      </p>
    </form>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (f.name.trim().length < 2) errs.name = 'Informe seu nome.';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(f.username)) errs.username = '3 a 20 caracteres: letras, números ou _.';
    if (!emailRe.test(f.email)) errs.email = 'Informe um e-mail válido.';
    if (f.password.length < 8) errs.password = 'A senha deve ter ao menos 8 caracteres.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      await register(f);
      navigate({ to: '/' });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-sm space-y-4 py-10">
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <Field id="name" label="Nome" value={f.name} onChange={set('name')} error={errors.name} />
      <Field id="username" label="Usuário" value={f.username} onChange={set('username')} error={errors.username} />
      <Field id="email" label="E-mail" type="email" value={f.email} onChange={set('email')} error={errors.email} />
      <Field id="password" label="Senha" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} error={errors.password} />
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Criando…' : 'Cadastrar'}</Button>
      <p className="text-sm text-muted-foreground">Já tem conta? <Link to="/login" search={{}} className="underline">Entrar</Link></p>
    </form>
  );
}
