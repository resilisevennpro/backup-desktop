import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#resultados", label: "Resultados" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-card/85 backdrop-blur-xl border-b border-border py-3 shadow-card-luxe"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="container flex items-center justify-between">
        <a href="#" className="font-display text-xl md:text-2xl tracking-wide">
          Dra. Gabrielle <span className="gold-text font-semibold">Leão</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-primary transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={WHATSAPP_LINK}
          target="_blank" rel="noreferrer"
          className="hidden md:inline-flex shimmer items-center gap-2 bg-gradient-gold text-primary-foreground font-medium px-5 py-2.5 rounded-full shadow-gold hover:shadow-gold-strong transition-all"
        >
          Agendar Agora
        </a>
        <button
          className="md:hidden text-primary"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden mt-4 mx-4 glass-card p-6 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground hover:text-primary">
              {l.label}
            </a>
          ))}
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="bg-gradient-gold text-primary-foreground font-medium px-5 py-2.5 rounded-full text-center">
            Agendar Agora
          </a>
        </div>
      )}
    </header>
  );
};
