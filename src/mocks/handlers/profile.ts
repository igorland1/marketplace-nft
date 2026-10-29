import { http, HttpResponse, delay } from 'msw';
import { mockDb } from '../data/db';
import { NetworkType } from '@/types';

function extractUserId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    const parts = authHeader.replace('Bearer ', '').split('_');
    const userId = `${parts[3]}_${parts[4]}`;
    // If user does not exist in mockDb, consider token invalid / expired (401)
    if (!mockDb.findUserById(userId)) {
      return null;
    }
    return userId;
  }
  return null;
}

export const profileHandlers = [
  // GET /api/profile
  http.get('/api/profile', async ({ request }) => {
    await delay(120);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const user = mockDb.findUserById(userId);
    if (!user) {
      return HttpResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    const { passwordHash: _p1, ...safeUser } = user;
    void _p1;
    return HttpResponse.json(safeUser);
  }),

  // PATCH /api/profile - Atualizar perfil do colecionador
  http.patch('/api/profile', async ({ request }) => {
    await delay(200);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      username?: string;
      bio?: string;
      avatarUrl?: string;
    };

    const updated = mockDb.updateUser(userId, body);
    if (!updated) {
      return HttpResponse.json({ message: 'Falha ao atualizar perfil.' }, { status: 400 });
    }

    const { passwordHash: _p2, ...safeUser } = updated;
    void _p2;
    return HttpResponse.json(safeUser);
  }),

  // POST /api/profile/change-password
  http.post('/api/profile/change-password', async ({ request }) => {
    await delay(250);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        { message: 'Senha atual e nova senha são obrigatórias.' },
        { status: 400 }
      );
    }

    const user = mockDb.findUserById(userId);
    if (!user || user.passwordHash !== body.currentPassword) {
      return HttpResponse.json(
        { message: 'A senha atual está incorreta.' },
        { status: 400 }
      );
    }

    user.passwordHash = body.newPassword;
    mockDb.updateUser(userId, {});

    return HttpResponse.json({ message: 'Senha alterada com sucesso.' });
  }),

  // GET /api/wallets - Listar carteiras do usuário
  http.get('/api/wallets', async ({ request }) => {
    await delay(120);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const wallets = mockDb.getUserWallets(userId);
    return HttpResponse.json(wallets);
  }),

  // POST /api/wallets - Cadastrar ou atualizar carteira
  http.post('/api/wallets', async ({ request }) => {
    await delay(200);
    const userId = extractUserId(request);
    if (!userId) {
      return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      id?: string;
      address: string;
      network: NetworkType;
      label: string;
      isPrimary?: boolean;
    };

    if (!body.address || !body.label || !body.network) {
      return HttpResponse.json(
        { message: 'Endereço, rede e rótulo são obrigatórios.' },
        { status: 400 }
      );
    }

    const saved = mockDb.saveWallet({
      id: body.id,
      userId,
      address: body.address,
      network: body.network,
      label: body.label,
      isPrimary: Boolean(body.isPrimary),
      balanceEth: '2.5000', // Mock initial balance for new wallet
    });

    return HttpResponse.json(saved, { status: body.id ? 200 : 201 });
  }),
];
