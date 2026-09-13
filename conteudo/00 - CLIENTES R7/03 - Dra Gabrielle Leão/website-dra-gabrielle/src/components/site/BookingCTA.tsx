import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";

export const BookingCTA = () => {
  return (
    <section id="contato" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial-gold blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl animate-bokeh" />
        <div className="absolute top-20 right-20 w-56 h-56 rounded-full bg-primary-glow/15 blur-3xl animate-bokeh" style={{animationDelay:"3s"}} />
      </div>

      <div className="container max-w-5xl">
        <div className="text-center reveal">
          <span className="font-accent text-primary text-xl">Vamos conversar</span>
          <h2 className="mt-2 text-4xl md:text-6xl font-display text-balance">
            Pronta para transformar seu <span className="gold-text">sorriso?</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto">
            Agende sua consulta de avaliação e descubra a melhor versão do seu sorriso.
          </p>
        </div>

        <div className="mt-14 max-w-md mx-auto reveal">
          {/* WhatsApp */}
          <a
            href={WHATSAPP_LINK}
            target="_blank" rel="noreferrer"
            className="glass-card group p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-gold transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <MessageCircle size={26} />
            </div>
            <h3 className="mt-5 text-2xl font-display">Falar agora</h3>
            <p className="mt-2 text-muted-foreground text-sm">Resposta rápida via WhatsApp com nossa equipe.</p>
            <span className="mt-6 inline-flex items-center gap-2 bg-[#25D366] text-white font-medium px-5 py-3 rounded-full group-hover:gap-3 transition-all">
              <MessageCircle size={18} /> Abrir WhatsApp
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};
