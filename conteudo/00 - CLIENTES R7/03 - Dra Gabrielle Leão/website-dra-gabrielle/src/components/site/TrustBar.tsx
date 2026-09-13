const items = [
  "CRO-DF 14753",
  "Odontologia Estética",
  "Lentes em Resina",
  "Brasília-DF",
  "+500 Pacientes",
  "Resultados Reais",
];

export const TrustBar = () => {
  const all = [...items, ...items];
  return (
    <div className="relative border-y border-border bg-card/60 py-5 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {all.map((it, i) => (
          <div key={i} className="flex items-center gap-12 text-muted-foreground">
            <span className="text-primary text-xl">✦</span>
            <span className="font-accent text-xl tracking-wide">{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
