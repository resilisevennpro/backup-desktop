import { useEffect, useRef, useState } from "react";
import portrait from "@/assets/dra-chair.png";
import portrait2 from "@/assets/dra-laugh.png";
import { Instagram } from "lucide-react";

const useCounter = (target: number, active: boolean) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const dur = 1600;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setVal(Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, active]);
  return val;
};

export const About = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setActive(true),
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const posts = useCounter(97, active);
  const followers = useCounter(1772, active);
  const cases = useCounter(500, active);

  return (
    <section id="sobre" className="py-24 md:py-32 relative">
      <div className="container grid lg:grid-cols-2 gap-14 items-center" ref={ref}>
        <div className="relative reveal">
          <div className="absolute -inset-4 bg-gradient-radial-gold blur-2xl" />
          <div className="relative grid grid-cols-5 gap-4">
            <div className="col-span-3 rounded-2xl overflow-hidden border border-border shadow-luxe">
              <img src={portrait} alt="Dra. Gabrielle Leão - Cirurgiã-Dentista" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-2 flex flex-col gap-4 pt-12">
              <div className="rounded-2xl overflow-hidden border border-border shadow-luxe aspect-[3/4]">
                <img src={portrait2} alt="Dra. Gabrielle Leão sorrindo" className="w-full h-full object-cover" />
              </div>
              <div className="luxe-card p-5 text-center">
                <div className="font-accent text-primary text-base leading-none">CRO-DF</div>
                <div className="text-2xl font-display gold-text mt-1">14753</div>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal">
          <span className="font-accent text-primary text-xl">Prazer, Dra. Gabrielle</span>
          <h2 className="mt-2 text-4xl md:text-5xl font-display">
            Conheça a Dra. <span className="gold-text">Gabrielle Leão</span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Cirurgiã-Dentista especialista em Odontologia Estética em Brasília, com foco em lentes em resina,
            facetas e protocolos completos de design de sorriso. Une técnica refinada e olhar estético para criar
            sorrisos naturais, harmônicos e únicos para cada paciente.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { v: posts, label: "Posts" },
              { v: followers.toLocaleString("pt-BR"), label: "Seguidores" },
              { v: `${cases}+`, label: "Casos" },
            ].map((s) => (
              <div key={s.label} className="glass-card text-center px-3 py-4">
                <div className="text-2xl font-display gold-text">{s.v}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <a
            href="https://instagram.com/dra.gabrielleleao"
            target="_blank" rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 border border-primary/40 px-6 py-3 rounded-full hover:bg-primary/10 transition-all"
          >
            <Instagram size={18} className="text-primary" /> Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
};
