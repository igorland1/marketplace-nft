import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';

const features = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="mx-auto mt-20 w-full max-w-[1200px] px-4 pb-24 md:pb-8">
      {/* Top Value Propositions & Newsletter */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.letter} className="space-y-3">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-sm"
              >
                {f.letter}
              </span>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}

          {/* Newsletter Box (Figma) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold leading-snug">
              Antecipe-se ao próximo lançamento
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-1.5 rounded-md bg-primary/10 p-2 text-xs text-primary">
                <Check className="h-4 w-4 shrink-0" />
                <span>Inscrição realizada com sucesso!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    aria-label="Digite seu e-mail para a newsletter"
                    placeholder="digite seu e-mail..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Enviar
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Kurio Slogan and Contact bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs">
          <span className="font-bold tracking-widest text-foreground">KURIO</span>
          <span className="text-muted-foreground text-center">
            Feito para colecionadores, criadores e cultura
          </span>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <a href="mailto:contato@email.com" className="hover:text-foreground transition-colors">
              contato@email.com
            </a>
            <span aria-hidden>•</span>
            <a href="tel:+551140028922" className="hover:text-foreground transition-colors">
              +55 11 4002 8922
            </a>
          </div>
        </div>

        {/* 4 Navigation Columns */}
        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-border/60 pt-8 sm:grid-cols-4 text-xs">
          {/* Meu Perfil */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Meu perfil</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/profile" className="hover:text-foreground transition-colors">
                  Meu perfil
                </Link>
              </li>
              <li>
                <Link to="/wallets" className="hover:text-foreground transition-colors">
                  Minha coleção
                </Link>
              </li>
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Atividade</span>
              </li>
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Estúdio do criador</span>
              </li>
              <li>
                <Link to="/profile" className="hover:text-foreground transition-colors">
                  Lista de interesse
                </Link>
              </li>
            </ul>
          </div>

          {/* Central de Ajuda */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Central de ajuda</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Central de ajuda</span>
              </li>
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Como comprar NFTs</span>
              </li>
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Carteira e segurança</span>
              </li>
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Política do mercado</span>
              </li>
              <li>
                <span className="cursor-not-allowed text-muted-foreground/90">Denunciar item</span>
              </li>
            </ul>
          </div>

          {/* Coleções */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Coleções</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/" search={{ collection: 'digital_art' }} className="hover:text-foreground transition-colors">
                  Arte digital
                </Link>
              </li>
              <li>
                <Link to="/" search={{ collection: 'photography' }} className="hover:text-foreground transition-colors">
                  Fotografia
                </Link>
              </li>
              <li>
                <Link to="/" search={{ collection: 'music' }} className="hover:text-foreground transition-colors">
                  Música
                </Link>
              </li>
              <li>
                <Link to="/" search={{ collection: '3d_art' }} className="hover:text-foreground transition-colors">
                  Arte 3D
                </Link>
              </li>
              <li>
                <Link to="/" search={{ collection: 'utility' }} className="hover:text-foreground transition-colors">
                  Utilidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociais & Carteiras Compatíveis */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Redes sociais</h4>
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  X (Twitter)
                </a>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Discord
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Instagram
                </a>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <h5 className="font-semibold text-foreground text-[11px]">Carteiras compatíveis</h5>
              <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                METAMASK • WALLETCONNECT • COINBASE
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}
