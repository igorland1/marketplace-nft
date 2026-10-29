import { useState } from 'react';
import { useChangePassword, useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/format';
import { User } from '@/types';

function ProfileForm({ profile }: { profile: User }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Informe seu nome.';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) errs.username = '3 a 20 caracteres: letras, números ou _.';
    if (avatarUrl && !/^https?:\/\//.test(avatarUrl)) errs.avatar = 'Informe uma URL http(s) válida.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    update.mutate(
      { name, username, bio, avatarUrl },
      { onSuccess: () => setMsg({ ok: true, text: 'Perfil atualizado.' }), onError: (err) => setMsg({ ok: false, text: errorMessage(err) }) },
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h2 className="text-lg font-semibold">Dados do colecionador</h2>
      <div className="flex items-center gap-3">
        <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
        <div className="flex-1"><Field id="avatar" label="URL do avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} error={errors.avatar} /></div>
      </div>
      <Field id="p-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Field id="p-username" label="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} />
      <Field id="p-bio" label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      {msg && <p role="status" className={msg.ok ? 'text-sm text-primary' : 'text-sm text-destructive'}>{msg.text}</p>}
      <Button type="submit" disabled={update.isPending}>Salvar alterações</Button>
    </form>
  );
}

function PasswordForm() {
  const change = useChangePassword();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!cur) errs.cur = 'Informe a senha atual.';
    if (next.length < 8) errs.next = 'A nova senha deve ter ao menos 8 caracteres.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    change.mutate(
      { currentPassword: cur, newPassword: next },
      {
        onSuccess: () => { setMsg({ ok: true, text: 'Senha alterada.' }); setCur(''); setNext(''); },
        onError: (err) => setMsg({ ok: false, text: errorMessage(err) }),
      },
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h2 className="text-lg font-semibold">Alterar senha</h2>
      <Field id="cur" label="Senha atual" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} error={errors.cur} />
      <Field id="next" label="Nova senha" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} />
      {msg && <p role="status" className={msg.ok ? 'text-sm text-primary' : 'text-sm text-destructive'}>{msg.text}</p>}
      <Button type="submit" variant="outline" disabled={change.isPending}>Alterar senha</Button>
    </form>
  );
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  return (
    <div className="mx-auto max-w-lg space-y-10">
      <h1 className="text-2xl font-bold">Perfil do colecionador</h1>
      {isLoading || !profile ? <Skeleton className="h-64" /> : <ProfileForm profile={profile} />}
      <PasswordForm />
    </div>
  );
}
