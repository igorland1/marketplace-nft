const features = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades e listas de acesso antecipado.' },
];

export function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-[1200px] px-4 pb-24 md:pb-8">
      <div className="bg-card">
        <div className="grid gap-6 p-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.letter} className="space-y-2">
              <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{f.letter}</span>
              <h2 className="text-sm">{f.title}</h2>
              <p className="text-xs text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-accent px-6 py-3 text-xs">
          <span className="font-bold tracking-widest">KURIO</span>
          <span className="text-muted-foreground">Feito para colecionadores, criadores e cultura</span>
          <span className="text-muted-foreground">contato@email.com</span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  );
}
