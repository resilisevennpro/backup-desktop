import { Calendar, MessageCircle, PencilRuler, Sparkles } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";

const steps = [
  { n: "01", icon: Calendar, title: "Consulta de avaliação", desc: "Diagnóstico inicial gratuito para entender seus objetivos e expectativas." },
  { n: "02", icon: PencilRuler, title: "Planejamento personalizado", desc: "Design digital do sorriso ideal para o seu rosto e personalidade." },
  { n: "03", icon: Sparkles, title: "Transformação realizada", desc: "Execução com precisão técnica e acabamento de alta estética." },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="font-accent text-primary text-xl">Processo</span>
          <h2 className="mt-2 text-4xl md:text-5xl font-display">
            Seu novo sorriso em <span className="gold-text">3 passos</span>
          </h2>
        </div>

        <div className="mt-20 relative grid md:grid-cols-3 gap-10">
          {/* connecting line */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {steps.map((s, i) => (
            <div key={s.n} className="reveal text-center" style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="relative mx-auto w-20 h-20 rounded-full bg-card border border-primary/40 flex items-center justify-center shadow-gold">
                <s.icon className="text-primary" size={28} />
                <span className="absolute -top-2 -right-2 bg-gradient-gold text-primary-foreground text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-display">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center reveal">
          <p className="text-muted-foreground">
            Comece pelo primeiro passo: sua avaliação é gratuita.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-[#25D366] text-white font-medium px-6 py-3.5 rounded-full hover:gap-3 hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle size={18} /> Agendar minha avaliação
          </a>
        </div>
      </div>
    </section>
  );
};
