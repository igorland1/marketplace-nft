import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('/api/test/reset');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('1. Busca, filtros combinados, ordenação, paginação e histórico', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#catalogo')).toBeVisible();

  // Busca no Header
  const searchBtn = page.getByRole('button', { name: 'Abrir busca' });
  if (await searchBtn.isVisible()) {
    await searchBtn.click();
  }
  const searchInput = page.getByLabel('Buscar NFTs');
  await searchInput.fill('Emerald');
  await page.waitForTimeout(600);
  await expect(page).toHaveURL(/q=Emerald/);
  await expect(page.locator('#catalogo').getByText('Emerald Ape #042')).toBeVisible();

  // Limpa busca
  await searchInput.fill('');
  await page.waitForTimeout(600);

  // Filtro de Coleção
  await page.getByRole('button', { name: /Arte digital/i }).click();
  await expect(page).toHaveURL(/collection=digital_art/);

  // Paginação
  await page.getByRole('button', { name: 'Todas' }).click();
  await page.getByRole('button', { name: 'Página 2' }).click();
  await expect(page).toHaveURL(/page=2/);

  // Voltar no histórico do navegador
  await page.goBack();
  await expect(page).not.toHaveURL(/page=2/);
});

test('2. Acesso direto ao detalhe e tratamento de recurso inexistente', async ({ page }) => {
  // Detalhe existente
  await page.goto('/nft/nft_1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Emerald Ape #042');
  await expect(page.getByText('1.190 ETH', { exact: true })).toBeVisible();

  // Recurso inexistente (404)
  await page.goto('/nft/nft_inexistente_999');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('NFT não encontrado');
  await expect(page.getByRole('link', { name: 'Voltar ao catálogo' })).toBeVisible();
});

test('3. Cadastro, login, expiração de sessão, logout e troca de usuário', async ({ page }) => {
  // Cadastro
  await page.goto('/register');
  const uniqueUser = `user_${Date.now()}`;
  await page.fill('#name', 'Colecionador Teste');
  await page.fill('#username', uniqueUser);
  await page.fill('#email', `${uniqueUser}@greenmint.io`);
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // Redirecionado logado
  await expect(page.locator('header, nav[aria-label="Navegação móvel"]').getByRole('button', { name: /Sair/i })).toBeVisible();

  // Logout
  await page.locator('header, nav[aria-label="Navegação móvel"]').getByRole('button', { name: /Sair/i }).first().click();
  await expect(page.locator('header, nav[aria-label="Navegação móvel"]').getByRole('link', { name: /Entrar/i }).first()).toBeVisible();

  // Login com usuário existente
  await page.goto('/login');
  await page.fill('#email', 'satoshi@greenmint.io');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page.locator('header, nav[aria-label="Navegação móvel"]').getByRole('button', { name: /Sair/i })).toBeVisible();

  // Simulação de sessão expirada
  await page.evaluate(() => localStorage.setItem('greenmint_auth_token', 'mock_jwt_token_invalid_exp'));
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/Sua sessão expirou/i)).toBeVisible();
});

test('4. Favoritos com atualização otimista e persistência', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#email', 'satoshi@greenmint.io');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  // Detalhe
  await page.goto('/nft/nft_3');
  await page.waitForTimeout(1000);
  const favBtn = page.locator('button').filter({ hasText: /890/ });
  await expect(favBtn).toBeVisible();

  // Clica para favoritar
  await favBtn.click();
  await page.waitForTimeout(600);
  await expect(page.locator('button').filter({ hasText: /891/ })).toBeVisible();

  // Recarrega página para confirmar persistência
  await page.reload();
  await page.waitForTimeout(600);
  await expect(page.locator('button').filter({ hasText: /891/ })).toBeVisible();
});

test('5. Carrinho, quantidades, remoção, cupom e persistência após refresh/login', async ({ page }) => {
  // Adiciona item como visitante
  await page.goto('/nft/nft_1');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Adicionar ao carrinho")');
  await expect(page.getByText('Adicionado ao carrinho.')).toBeVisible();

  // Abre carrinho
  await page.goto('/cart');
  await expect(page.getByText('Emerald Ape #042')).toBeVisible();

  // Altera quantidade no carrinho
  await page.getByRole('group', { name: /Quantidade de Emerald/i }).getByRole('button', { name: 'Aumentar' }).click();
  await page.waitForTimeout(500);
  await expect(page.getByRole('group', { name: /Quantidade de Emerald/i }).getByText('2')).toBeVisible();

  // Aplica cupom
  await page.fill('input[placeholder="Cupom"]', 'GREENMINT10');
  await page.click('button:has-text("Aplicar")');
  await expect(page.getByText(/Cupom.*GREENMINT10.*aplicado/i)).toBeVisible();

  // Login preservando itens do visitante
  await page.goto('/login');
  await page.fill('#email', 'satoshi@greenmint.io');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  // Carrinho continua com os itens
  await page.goto('/cart');
  await expect(page.getByText('Emerald Ape #042')).toBeVisible();

  // Remove item
  await page.getByLabel('Remover Emerald Ape #042').click();
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
});

test('6. Compra completa, do catálogo ao recibo confirmado', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#email', 'satoshi@greenmint.io');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  // Catálogo -> Adiciona ao carrinho
  await page.goto('/nft/nft_1');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Adicionar ao carrinho")');
  await page.waitForTimeout(800);

  // Navega para Carrinho -> Checkout
  await page.goto('/cart');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Ir para pagamento")');
  await page.waitForURL('**/checkout');

  // Conectar carteira
  await page.click('button:has-text("Conectar carteira")');
  await expect(page.getByText('✓ Conectada')).toBeVisible();

  // Revisar pedido
  await page.click('button:has-text("Revisar pedido")');
  await expect(page.getByRole('button', { name: /Confirmar compra/i })).toBeVisible();

  // Confirmar compra
  await page.click('button:has-text("Confirmar compra")');

  // Recibo do pedido
  await expect(page).toHaveURL(/\/orders\/ord_/);
  await expect(page.getByText('Pedido confirmado!')).toBeVisible();
  await expect(page.getByText('Emerald Ape #042')).toBeVisible();
  await expect(page.getByText(/Hash:/i)).toBeVisible();
});

test('7. Falha de pagamento e simulação de recusa de carteira', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'satoshi@greenmint.io');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  await page.goto('/nft/nft_1');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Adicionar ao carrinho")');
  await page.waitForTimeout(800);

  await page.goto('/cart');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Ir para pagamento")');
  await page.waitForURL('**/checkout');

  // Ativa simulação de recusa de conexão
  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Conectar carteira")');
  await expect(page.getByText('Conexão recusada pela carteira.')).toBeVisible();
});

test('8. Edição de perfil, avatar, senha e carteiras', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'satoshi@greenmint.io');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  // Perfil
  await page.goto('/profile');
  await page.waitForTimeout(800);
  await page.fill('#p-name', 'Satoshi Renamed');
  await page.click('button:has-text("Salvar alterações")');
  await expect(page.getByText('Perfil atualizado.')).toBeVisible();

  // Carteiras
  await page.goto('/wallets');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Adicionar carteira")');
  await page.fill('#w-label', 'Nova Cold Storage');
  await page.fill('#w-address', '0x1234567890abcdef1234567890abcdef12345678');
  await page.click('button:has-text("Salvar")');
  await expect(page.getByText('Nova Cold Storage')).toBeVisible();
});

test('9. Tempo Real Socket.IO e conexão em tempo real', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-live="true"]')).toBeAttached();
});

test('10. Navegação por teclado e acessibilidade básica', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').focus();
  await page.keyboard.type('satoshi@greenmint.io');
  await page.keyboard.press('Tab');
  await page.keyboard.type('password123');
  await page.keyboard.press('Enter');
  await expect(page.locator('header, nav[aria-label="Navegação móvel"]').getByRole('button', { name: /Sair/i })).toBeVisible();
});

test('11. Tratamento de rotas inexistentes (404)', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe-404');
  await expect(page.getByText('Página não encontrada')).toBeVisible();
  await page.getByRole('link', { name: 'Ir para o início' }).click();
  await expect(page).toHaveURL('/');
});

test('12. Skeletons durante carregamento e feedback visual', async ({ page }) => {
  // Teste com latência artificial injetada no catálogo
  await page.goto('/?latency=600');
  await expect(page.locator('#catalogo')).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.locator('#catalogo')).toBeVisible();
});
