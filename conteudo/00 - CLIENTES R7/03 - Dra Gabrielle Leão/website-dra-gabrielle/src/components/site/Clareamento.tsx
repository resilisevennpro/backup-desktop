import { Sun, Sparkles } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";
import c1 from "@/assets/clareamento-1.jpg";
import c2 from "@/assets/clareamento-2.jpeg";
import c3 from "@/assets/clareamento-3.jpeg";
import c4 from "@/assets/clareamento-4.jpeg";
import cAntes from "@/assets/clareamento-antes.jpeg";

const gallery = [
  { src: c2, label: "Antes & Depois", caption: "Comparativo lado a lado", span: "md:col-span-2 md:row-span-2 aspect-[4/5]" },
  { src: cAntes, label: "Antes do protocolo", caption: "Cor inicial registrada", span: "aspect-square" },
  { src: c4, label: "Resultado final", caption: "Tom uniforme e vivo", span: "aspect-[4/5]" },
  { src: c1, label: "Pós clareamento", caption: "Sorriso renovado", span: "aspect-[4/5]" },
];

export const Clareamento = () => {
  return (
    <section id="clareamento" className="py-24 md:py-32 relative overflow-hidden">
      <div aria-hidden className="absolute -top-20 right-0 w-[480px] h-[480px] rounded-full bg-gradient-radial-gold blur-3xl opacity-70 pointer-events-none" />

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-5 reveal">
            <span className="inline-flex items-center gap-2 font-accent text-primary text-xl">
              <span className="h-px w-10 bg-primary/60" />
              Clareamento Dental
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Até <span className="gold-text italic font-accent">8 tons</span> mais branco,
              sem perder o natural.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              Protocolo profissional supervisionado pela Dra. Gabrielle Leão.
              Avaliação personalizada, dessensibilização e produtos de alta concentração
              para um resultado uniforme, brilhante e seguro.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { v: "8", label: "Tons +" },
                { v: "1h", label: "Sessão" },
                { v: "100%", label: "Esmalte preservado" },
              ].map((s) => (
                <div key={s.label} className="glass-card text-center px-3 py-4">
                  <div className="text-2xl font-display gold-text">{s.v}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank" rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-gradient-gold text-primary-foreground font-medium px-6 py-3 rounded-full shadow-gold hover:shadow-gold-strong transition-all"
            >
              <Sun size={16} /> Quero clarear meu sorriso
            </a>
          </div>

          <div className="lg:col-span-7 reveal">
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] md:auto-rows-[160px] gap-3">
              {gallery.map((g, i) => (
                <figure
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border border-border shadow-luxe ${g.span}`}
                >
                  <img
                    src={g.src}
                    alt={`Clareamento — ${g.label}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/0 to-transparent" />
                  <figcaption className="absolute bottom-0 left-0 right-0 p-3 text-card">
                    <div className="font-accent text-primary-glow text-base leading-none">{g.label}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-80">{g.caption}</div>
                  </figcaption>
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card/85 backdrop-blur flex items-center justify-center">
                    <Sparkles size={12} className="text-primary" />
                  </span>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
