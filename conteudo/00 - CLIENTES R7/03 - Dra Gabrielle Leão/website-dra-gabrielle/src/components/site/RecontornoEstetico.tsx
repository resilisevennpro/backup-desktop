import { Gem } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";
import r1 from "@/assets/recontorno-2.jpeg";
import r2 from "@/assets/recontorno-1.jpeg";

export const RecontornoEstetico = () => {
  return (
    <section id="recontorno" className="py-24 md:py-32 relative overflow-hidden bg-gradient-cream">
      <div aria-hidden className="absolute -bottom-32 -left-20 w-[520px] h-[520px] rounded-full bg-gradient-radial-gold blur-3xl opacity-60 pointer-events-none" />
      <div aria-hidden className="absolute right-4 top-10 font-display italic text-[12rem] leading-none text-primary/10 select-none pointer-events-none hidden md:block">
        re
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Editorial image stack */}
          <div className="lg:col-span-7 reveal order-2 lg:order-1">
            <div className="grid grid-cols-12 gap-4">
              <figure className="col-span-7 relative rounded-2xl overflow-hidden border border-border shadow-luxe aspect-[3/4] group">
                <img
                  src={r1}
                  alt="Recontorno estético — antes do procedimento"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-card/90 backdrop-blur border border-border text-foreground">
                  Antes
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
              </figure>

              <div className="col-span-5 flex flex-col gap-4">
                <figure className="relative rounded-2xl overflow-hidden border border-border shadow-luxe aspect-[3/4] group mt-8">
                  <img
                    src={r2}
                    alt="Recontorno estético — depois do procedimento"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-gradient-gold text-primary-foreground">
                    Depois
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                </figure>

                <div className="luxe-card p-5">
                  <div className="font-accent text-primary text-sm">Procedimento</div>
                  <div className="font-display text-lg leading-tight mt-1">Sem desgaste agressivo</div>
                  <div className="text-xs text-muted-foreground mt-2">Apenas polimento e ajuste milimétrico do esmalte</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-5 reveal order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 font-accent text-primary text-xl">
              <span className="h-px w-10 bg-primary/60" />
              Recontorno Estético
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Pequenos ajustes,
              <br />
              <span className="gold-text italic font-accent">grandes mudanças</span>.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              Técnica minimamente invasiva que harmoniza o contorno dos dentes,
              corrige bordas irregulares e devolve simetria ao sorriso —
              tudo isso em uma única sessão, sem anestesia e sem desgaste agressivo.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Resultado imediato em uma sessão",
                "Sem anestesia, sem dor",
                "Esmalte natural preservado",
                "Acabamento polido com brilho de espelho",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-gold shadow-gold flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP_LINK}
              target="_blank" rel="noreferrer"
              className="mt-9 inline-flex items-center gap-2 border border-primary/40 px-6 py-3 rounded-full hover:bg-primary/10 transition-all font-medium"
            >
              <Gem size={16} className="text-primary" />
              Avaliar meu sorriso
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
