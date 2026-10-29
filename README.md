# GreenMint / Kurio — NFT Marketplace

Implementação completa do desafio frontend **GreenMint / Kurio NFT Marketplace**, construída em **React 18**, **TypeScript**, **TanStack Router**, **TanStack Query**, **Axios**, **Tailwind CSS**, componentes inspirados em **shadcn/ui**, camada de rede simulada com **Mock Service Worker (MSW)** e **Socket.IO client**, suíte de testes E2E e regressão visual com **Playwright**, e auditoria automatizada de performance com **Lighthouse CI**.

Design original e tokens visuais sincronizados com o [Figma oficial do desafio](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: Versão 18.x ou superior (Recomendado: 20+)
- **npm** (ou yarn/pnpm)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/igorland1/marketplace-nft.git
cd marketplace-nft

# Instale as dependências
npm install
```

### Comandos Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite em `http://localhost:5173` |
| `npm run build` | Valida tipagem (`tsc -b`) e compila o bundle de produção otimizado |
| `npm run preview` | Executa o preview local da build de produção em `http://localhost:4173` |
| `npm run lint` | Executa a verificação de código com ESLint |
| `npm run test` | Executa a suíte completa de 32 testes E2E e Regressão Visual no Playwright |
| `npm run test:visual` | Executa exclusivamente os testes de regressão visual com snapshots |
| `npm run audit` | Executa a auditoria completa de produção do Lighthouse CI (Desktop e Mobile) |

---

## 👤 Credenciais de Acesso para Testes

O ambiente de simulação MSW inclui contas de colecionador pré-configuradas e determinísticas:

| Nome | E-mail | Senha | Perfil & Dados |
| --- | --- | --- | --- |
| **Satoshi Nakamoto** | `satoshi@greenmint.io` | `password123` (ou `senha123`) | Colecionador verificado, 2 carteiras vinculadas, histórico de pedidos e itens favoritos |
| **Elena Rostova** | `elena@greenmint.io` | `password123` (ou `senha123`) | Colecionadora verificada, carteira secundária e preferências personalizadas |

> **Nota**: Novos cadastros podem ser efetuados livremente na tela `/register`. A aplicação persiste dados no `localStorage` e pode ser resetada a qualquer momento através do endpoint `POST /api/test/reset`.

### Cupons de Desconto Disponíveis no Carrinho
- `GREENMINT10` (ou `GREEN10`): 10% de desconto sobre o subtotal.
- `NFTVIP20` (ou `VIP20`): 20% de desconto sobre o subtotal.
- `EXPIRED50`: Cupom expirado para testar feedback e tratamento de erro.

---

## 🏆 Resultados da Auditoria Lighthouse CI

Executado em ambiente de produção (`npm run preview`) através do script automatizado `npm run audit`:

| Página & Resolução | Performance | Accessibility | Best Practices | SEO | Status |
| --- | :---: | :---: | :---: | :---: | :---: |
| **Catálogo / Home (Desktop)** | **100** | **100** | **100** | **92** | ✅ Aprovado |
| **Catálogo / Home (Mobile)** | **98** | **100** | **100** | **92** | ✅ Aprovado |
| **Detalhes do NFT (Desktop)** | **100** | **100** | **96** | **92** | ✅ Aprovado |
| **Detalhes do NFT (Mobile)** | **98** | **100** | **96** | **92** | ✅ Aprovado |

*Metas exigidas pelo desafio: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.*

---

## 🧪 Cobertura de Testes E2E e Regressão Visual (Playwright)

A suíte em `tests/` cobre os 12 cenários obrigatórios em Chromium Desktop (1280x720) e Mobile Safari / Chrome (390x844), totalizando **32 testes com 100% de aprovação**:

1. **Busca, filtros combinados, ordenação e paginação**: Validação de parâmetros na URL e histórico do navegador (`pushState`/`popState`).
2. **Acesso direto ao detalhe e 404**: Exibição de informações completas e tratamento amigável de NFTs inexistentes.
3. **Autenticação completa**: Cadastro, login, logout, expiração simulada de token e troca de usuário com limpeza de cache.
4. **Favoritos com Atualização Otimista**: Alternância instantânea de estado com persistência e rollback em falhas simuladas.
5. **Carrinho e Descontos**: Incremento, decremento, remoção de itens, aplicação de cupom e persistência após refresh/login.
6. **Fluxo Completo de Compra**: Do catálogo até a confirmação de pedido, recibo detalhado e esvaziamento do carrinho.
7. **Resiliência e Idempotência**: Simulação de recusa de carteira, falhas de rede, reenvios e proteção contra pedidos duplicados.
8. **Edição de Perfil e Carteiras**: Alteração de nome, biografia, upload de avatar, troca de senha e gestão de carteiras.
9. **Tempo Real com Socket.IO**: Conexão WebSocket interceptada pelo MSW e indicador visual de conexão ao vivo (`LIVE`).
10. **Acessibilidade e Navegação por Teclado**: Foco visível, navegação por `Tab` e conformidade com WAI-ARIA.
11. **Tratamento de Rotas Inexistentes**: Página 404 customizada com link de retorno funcional.
12. **Skeletons Estruturados**: Shimmer effect e dimensionamento exato prevenindo Cumulative Layout Shift (CLS).
13. **Regressão Visual**: Comparação pixel a pixel de snapshots baseline para Home, Detalhes, Carrinho e Login.

Para rodar os testes:
```bash
npx playwright test
```

---

## 📐 Arquitetura da Solução

Para detalhes aprofundados sobre a arquitetura, gerenciamento de estado remoto com TanStack Query, contratos tipados, ciclo de vida do MSW, eventos de WebSockets e concorrência, consulte o documento:

👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🌐 Instruções de Deploy

A aplicação está pronta para deploy contínuo em qualquer serviço de hospedagem estática / CDN:

### Vercel
O repositório já inclui `vercel.json` configurado para SPA rewrites:
```bash
npx vercel --prod
```

### Netlify
O repositório já inclui `public/_redirects` para SPA routing:
```bash
npx netlify deploy --prod --dir=dist
```

### Cloudflare Pages
1. Build command: `npm run build`
2. Output directory: `dist`
3. Single Page Application (SPA) habilitado nativamente.

---

<details>
<summary><strong>📋 Especificação Original do Desafio (Clique para expandir)</strong></summary>

## 1. Escopo
Entregue os fluxos de descoberta, compra e conta do colecionador, com versões desktop e mobile. APIs, autenticação, carteiras e pagamentos devem funcionar com dados simulados. Integrações reais com blockchain, extensões de carteira e gateways de pagamento estão fora do escopo.

## 2. Stack obrigatória
- Interface: React
- Linguagem: TypeScript
- Roteamento: TanStack Router
- Estado remoto: TanStack Query
- Cliente HTTP: Axios
- Integração de dados: REST APIs
- Tempo real: Socket.IO
- Estilização: Tailwind CSS
- Componentes: shadcn/ui
- Mocking: MSW
- Testes E2E e regressão visual: Playwright
- Auditoria de performance e qualidade: Lighthouse

## 3. Telas e fluxos
- Início: Destaques, catálogo, busca, filtros, ordenação e navegação para o NFT
- Detalhes do NFT: Galeria, informações, edição, quantidade, favoritos e compra
- Carrinho de NFTs: Edição de quantidades, remoção, cupom e resumo de valores
- Pagamento: Dados do colecionador, seleção de carteira e rede, revisão e envio do pedido
- Confirmação de pedido: Resultado, identificação da transação, itens, taxas e total
- Login: Autenticação, validação e retorno ao fluxo anterior
- Cadastro: Criação de conta, validação e tratamento de conflito
- Perfil do colecionador: Edição dos dados, avatar e alteração de senha
- Carteiras: Cadastro e edição de carteiras principal e secundária

## 4. Integração e estado
Use TanStack Router nas rotas, parâmetros de busca e proteção dos fluxos privados. Use TanStack Query nas consultas, mutations e sincronização do cache. As chamadas REST devem passar pelo Axios.

## 5. Mocking com MSW
Implemente os mocks na camada de rede, reutilizando contratos e cenários entre desenvolvimento, demonstração e testes. Componentes, hooks e cliente Axios não devem conter respostas fictícias ou caminhos alternativos de negócio.

## 6. Tempo real com Socket.IO
Implemente `nft.updated` e `order.updated`, com reconciliação pós-reconexão e tolerância a eventos duplicados.

## 7. Performance e Lighthouse
Audite início e detalhe com Lighthouse em perfis mobile e desktop:
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 90

</details>
