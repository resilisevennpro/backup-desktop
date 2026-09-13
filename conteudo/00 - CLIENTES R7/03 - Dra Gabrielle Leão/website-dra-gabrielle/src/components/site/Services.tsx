import { Sparkles, Gem, Sun, Camera, ArrowRight } from "lucide-react";

const services = [
  { icon: Sparkles, title: "Lentes em Resina", desc: "Transformação minimamente invasiva com acabamento natural e brilho duradouro." },
  { icon: Gem, title: "Facetas Dentais", desc: "Design de sorriso personalizado com facetas de alta estética e durabilidade." },
  { icon: Sun, title: "Clareamento", desc: "Protocolos profissionais para um sorriso até 8 tons mais branco com segurança." },
  { icon: Camera, title: "Protocolo Completo", desc: "Planejamento digital e reabilitação total do sorriso, do diagnóstico à entrega." },
];

export const Services = () => {
  return (
    <section id="servicos" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="font-accent text-primary text-xl">Nossos serviços</span>
          <h2 className="mt-2 text-4xl md:text-5xl font-display">
            O que fazemos pelo seu <span className="gold-text">sorriso</span>
          </h2>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="reveal glass-card group p-7 hover:-translate-y-2 hover:shadow-gold transition-all duration-500"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-gold-soft border border-primary/30 flex items-center justify-center text-primary group-hover:bg-gradient-gold group-hover:text-primary-foreground transition-all">
                <s.icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-display">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <a href="#contato" className="mt-5 inline-flex items-center gap-1 text-sm text-primary opacity-80 group-hover:opacity-100 group-hover:gap-2 transition-all">
                Saiba mais <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
