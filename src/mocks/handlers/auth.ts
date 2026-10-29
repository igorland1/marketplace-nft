import { http, HttpResponse, delay } from 'msw';
import { mockDb } from '../data/db';

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = mockDb.findUserByEmail(body.email);
    if (!user || user.passwordHash !== body.password) {
      return HttpResponse.json(
        { message: 'Credenciais inválidas. Verifique os dados informados.' },
        { status: 401 }
      );
    }

    // Merge guest cart items into user cart on login
    mockDb.mergeGuestCartIntoUser(user.id);

    const token = `mock_jwt_token_${user.id}_${Date.now()}`;
    const { passwordHash: _password, ...userWithoutPass } = user;
    void _password;

    return HttpResponse.json({
      user: userWithoutPass,
      token,
    });
  }),

  // POST /api/auth/register
  http.post('/api/auth/register', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as {
      name?: string;
      username?: string;
      email?: string;
      password?: string;
    };

    if (!body.name || !body.username || !body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingUser = mockDb.findUserByEmail(body.email);
    if (existingUser) {
      return HttpResponse.json(
        { message: 'Este e-mail já está em uso por outro colecionador.' },
        { status: 409 }
      );
    }

    const newUser = mockDb.createUser({
      name: body.name,
      username: body.username,
      email: body.email,
      passwordHash: body.password,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: 'Novo colecionador no GreenMint.',
    });

    // Create a default initial wallet for newly registered user
    mockDb.saveWallet({
      userId: newUser.id,
      address: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      network: 'ethereum',
      isPrimary: true,
      label: 'Main Ethereum Wallet',
      balanceEth: '1.0000',
    });

    mockDb.mergeGuestCartIntoUser(newUser.id);

    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    const { passwordHash: _password2, ...userWithoutPass } = newUser;
    void _password2;

    return HttpResponse.json(
      {
        user: userWithoutPass,
        token,
      },
      { status: 201 }
    );
  }),

  // GET /api/auth/me
  http.get('/api/auth/me', async ({ request }) => {
    await delay(150);
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer mock_jwt_token_')) {
      return HttpResponse.json(
        { message: 'Não autenticado ou sessão expirada.' },
        { status: 401 }
      );
    }

    const tokenParts = authHeader.replace('Bearer ', '').split('_');
    const userId = `${tokenParts[3]}_${tokenParts[4]}`; // e.g. user_1
    const user = mockDb.findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'Colecionador não encontrado.' }, { status: 404 });
    }

    const { passwordHash: _password3, ...userWithoutPass } = user;
    void _password3;
    return HttpResponse.json({ user: userWithoutPass });
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', async () => {
    await delay(100);
    return HttpResponse.json({ success: true, message: 'Desconectado com sucesso.' });
  }),
];
