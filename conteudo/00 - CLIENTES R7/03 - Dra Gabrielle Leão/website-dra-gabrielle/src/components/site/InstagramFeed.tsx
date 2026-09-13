import { Instagram } from "lucide-react";
import a from "@/assets/case-a.png";
import b from "@/assets/case-b.png";
import c from "@/assets/case-c.png";
import d from "@/assets/case-d.png";
import e from "@/assets/case-e.png";
import f from "@/assets/case-f.png";
import g from "@/assets/case-g.png";
import dra from "@/assets/dra-laugh.png";

const posts = [a, b, c, d, e, f, g, dra];

export const InstagramFeed = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="font-accent text-primary text-xl">@dra.gabrielleleao</span>
          <h2 className="mt-2 text-4xl md:text-5xl font-display">
            Acompanhe no <span className="gold-text italic font-accent">Instagram</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 reveal">
          {posts.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/dra.gabrielleleao"
              target="_blank" rel="noreferrer"
              className="relative group aspect-square overflow-hidden rounded-xl border border-border shadow-card-luxe"
            >
              <img src={src} alt={`Publicação do Instagram da Dra. Gabrielle Leão sobre odontologia estética`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all flex items-center justify-center">
                <Instagram className="text-card opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center reveal">
          <a
            href="https://instagram.com/dra.gabrielleleao"
            target="_blank" rel="noreferrer"
            className="shimmer inline-flex items-center gap-2 bg-gradient-gold text-primary-foreground font-medium px-7 py-3.5 rounded-full shadow-gold hover:shadow-gold-strong transition-all"
          >
            <Instagram size={18} /> Ver perfil completo
          </a>
        </div>
      </div>
    </section>
  );
};
