import { useRef, useState } from "react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";
import caseAntes from "@/assets/case-antes.jpg";
import caseDepois from "@/assets/case-depois.jpg";
import caseJunto from "@/assets/case-junto.jpg";

type CaseItem =
  | { kind: "pair"; before: string; after: string; label: string }
  | { kind: "composite"; img: string; label: string };

const cases: CaseItem[] = [
  { kind: "pair", before: caseAntes, after: caseDepois, label: "Lentes em Resina" },
  { kind: "composite", img: caseJunto, label: "Design de Sorriso" },
];

const Slider = ({ item }: { item: CaseItem }) => {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  const isComposite = item.kind === "composite";

  return (
    <div className="reveal luxe-card p-3 group">
      <div
        ref={ref}
        className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-ew-resize select-none bg-muted"
        onMouseDown={() => (dragging.current = true)}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onMouseMove={(e) => dragging.current && handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {isComposite ? (
          <>
            {/* Composite image: left half = ANTES, right half = DEPOIS.
                Render full image at 200% width and shift left to show right half (DEPOIS). */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={item.img}
                alt={`${item.label} — depois`}
                draggable={false}
                className="absolute top-0 left-[-100%] h-full w-[200%] max-w-none object-cover"
              />
            </div>
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
              <img
                src={item.img}
                alt={`${item.label} — antes`}
                draggable={false}
                className="absolute top-0 left-0 h-full w-[200%] max-w-none object-cover"
              />
            </div>
          </>
        ) : (
          <>
            {/* DEPOIS — fills container */}
            <img
              src={item.after}
              alt={`${item.label} — depois`}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* ANTES — same-sized image, revealed via clip-path (no squish) */}
            <img
              src={item.before}
              alt={`${item.label} — antes`}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            />
          </>
        )}

        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-card/90 backdrop-blur border border-border text-foreground">Antes</span>
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-gradient-gold text-primary-foreground">Depois</span>

        <div className="absolute top-0 bottom-0 w-0.5 bg-card shadow-gold" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold-strong border-2 border-card">
            <span className="text-primary-foreground text-sm font-bold">⇆</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-card/90 bg-foreground/40 backdrop-blur px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Arraste
        </div>
      </div>
      <div className="px-2 pt-4 pb-1 flex items-center justify-between">
        <span className="font-accent text-primary text-lg">{item.label}</span>
        <span className="text-xs text-muted-foreground tracking-wider uppercase">Caso real</span>
      </div>
    </div>
  );
};

export const BeforeAfter = () => {
  return (
    <section id="resultados" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="font-accent text-primary text-xl">Antes & Depois</span>
          <h2 className="mt-2 text-4xl md:text-6xl font-display text-balance">
            Resultados que <span className="gold-text italic font-accent">falam por si</span>
          </h2>
          <p className="mt-5 text-muted-foreground">Casos reais. Sorrisos reais. Transformações documentadas no consultório da Dra. Gabrielle.</p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((c) => <Slider key={c.label} item={c} />)}

          {/* Editorial CTA card filling the third slot */}
          <a
            href={WHATSAPP_LINK}
            target="_blank" rel="noreferrer"
            className="reveal group relative luxe-card p-8 lg:p-10 flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-all duration-500"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-radial-gold blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
            <div aria-hidden className="absolute -bottom-12 -right-6 font-display italic text-[14rem] leading-none text-primary/10 select-none pointer-events-none">g</div>

            <div className="relative">
              <span className="inline-flex items-center gap-2 font-accent text-primary text-lg">
                <span className="h-px w-8 bg-primary/60" />
                O próximo sorriso
              </span>
              <h3 className="mt-4 font-display text-3xl md:text-4xl leading-tight text-balance">
                Pode ser o <span className="gold-text italic font-accent">seu</span>.
              </h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-[28ch]">
                Avaliação personalizada, plano sob medida e a técnica que transformou +500 sorrisos em Brasília.
              </p>
            </div>

            <div className="relative mt-8 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 bg-gradient-gold text-primary-foreground font-medium px-5 py-2.5 rounded-full shadow-gold group-hover:shadow-gold-strong transition-all">
                Agendar
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-display text-2xl gold-text leading-none">+500</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Sorrisos</span>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-12 text-center reveal">
          <a href="#contato" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-medium">
            Quero ver o meu antes & depois →
          </a>
        </div>
      </div>
    </section>
  );
};
