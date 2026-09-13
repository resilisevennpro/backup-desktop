import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star } from "lucide-react";

const items = [
  { name: "Mariana S.", quote: "A Dra. Gabrielle transformou meu sorriso completamente. Resultado naturalíssimo!", tag: "Lentes em Resina" },
  { name: "Camila R.", quote: "Profissionalismo e olhar estético impecáveis. Recomendo de olhos fechados.", tag: "Facetas" },
  { name: "Luana M.", quote: "Saí da clínica com mais autoestima do que jamais imaginei ter.", tag: "Clareamento" },
  { name: "Beatriz L.", quote: "Cada detalhe foi planejado pensando em mim. Sorriso dos sonhos!", tag: "Protocolo Completo" },
  { name: "Aline F.", quote: "Atendimento humano, ambiente sofisticado e resultado perfeito.", tag: "Lentes em Resina" },
];

export const Testimonials = () => {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });

  useEffect(() => {
    if (!embla) return;
    const id = setInterval(() => embla.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [embla]);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="font-accent text-primary text-xl">Depoimentos</span>
          <h2 className="mt-2 text-4xl md:text-5xl font-display">
            O que dizem nossas <span className="gold-text">pacientes</span>
          </h2>
        </div>
      </div>

      <div className="mt-14 relative">
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 px-6 md:px-16">
            {items.map((t, i) => (
              <div key={i} className="min-w-[300px] md:min-w-[380px] flex-shrink-0">
                <div className="glass-card p-7 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-display text-lg">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-primary fill-primary" />)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-muted-foreground leading-relaxed">"{t.quote}"</p>
                  <span className="mt-5 inline-block text-xs px-3 py-1 rounded-full border border-primary/30 text-primary font-accent">
                    {t.tag} ✦
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
