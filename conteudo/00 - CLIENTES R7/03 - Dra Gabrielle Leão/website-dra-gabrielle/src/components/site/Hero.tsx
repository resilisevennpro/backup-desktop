import heroImg from "@/assets/dra-hero.png";
import { ArrowRight, Star, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative grain min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      {/* bokeh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-bokeh" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary-glow/20 blur-3xl animate-bokeh" style={{ animationDelay: "2s" }} />
        <div className="absolute top-10 right-1/3 w-40 h-40 rounded-full bg-primary-glow/25 blur-2xl animate-bokeh" style={{ animationDelay: "4s" }} />
      </div>

      {/* faint serif monogram — desktop only */}
      <div aria-hidden className="absolute -left-10 top-1/3 font-display text-[28rem] leading-none text-primary/5 select-none pointer-events-none hidden lg:block">
        GL
      </div>

      <div className="container grid lg:grid-cols-12 gap-12 lg:gap-12 items-center">
        <div className="reveal lg:col-span-6 relative">
          <span className="inline-flex items-center gap-2 font-accent text-primary text-xl md:text-2xl">
            <span className="h-px w-10 bg-primary/60" />
            Odontologia Estética · Brasília
          </span>
          <h1 className="mt-4 font-display text-5xl md:text-7xl xl:text-8xl leading-[1.02] text-balance">
            Sorrisos
            <br />
            <span className="gold-text italic font-accent">esculpidos</span>
            <br />
            à mão.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
            Lentes em resina, facetas, recontorno estético e clareamento de alta precisão.
            Cada detalhe pensado para revelar a melhor versão do seu sorriso.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="#contato"
              className="shimmer group inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground font-medium px-7 py-4 rounded-full shadow-gold hover:shadow-gold-strong transition-all"
            >
              Quero meu sorriso novo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#resultados"
              className="inline-flex items-center justify-center gap-2 border border-primary/40 text-foreground font-medium px-7 py-4 rounded-full hover:bg-primary/10 transition-all"
            >
              Ver resultados
            </a>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-gradient-gold" />
              ))}
            </div>
            <span><span className="text-primary font-semibold">+500</span> sorrisos transformados</span>
          </div>
        </div>

        {/* Right: editorial portrait composition — same on mobile and desktop, just scaled */}
        <div className="relative reveal lg:col-span-6 flex justify-center lg:justify-end mt-4 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-radial-gold blur-2xl" />

          <div className="relative">
            <div className="absolute -inset-4 md:-inset-6 rounded-[2.5rem] border border-primary/30" />
            <div className="absolute -inset-8 md:-inset-12 rounded-[3rem] border border-primary/15" />

            <div className="relative w-[260px] sm:w-[320px] md:w-[420px] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-luxe bg-card animate-float-slow">
              <img
                src={heroImg}
                alt="Dra. Gabrielle Leão - Especialista em Odontologia Estética em Brasília"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
            </div>

            {/* floating credential card */}
            <div className="absolute -left-4 md:-left-16 bottom-10 md:bottom-12 luxe-card px-3.5 py-2.5 md:px-5 md:py-4 flex items-center gap-2 md:gap-3 animate-float-slow" style={{ animationDelay: "1.4s" }}>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground">
                <Sparkles size={14} className="md:hidden" />
                <Sparkles size={18} className="hidden md:block" />
              </div>
              <div className="text-xs md:text-sm">
                <div className="font-display text-sm md:text-base leading-tight">CRO-DF 14753</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Especialista</div>
              </div>
            </div>

            {/* small rating chip */}
            <div className="absolute right-2 md:right-4 -bottom-3 md:-bottom-6 luxe-card px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-1.5 md:gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="md:hidden text-primary fill-primary" />)}
                {[...Array(5)].map((_, i) => <Star key={`d${i}`} size={12} className="hidden md:inline text-primary fill-primary" />)}
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">5.0 · pacientes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
