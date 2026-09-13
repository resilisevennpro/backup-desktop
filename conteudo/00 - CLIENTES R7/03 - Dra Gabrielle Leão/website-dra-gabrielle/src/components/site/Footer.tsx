import { Instagram, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/60 py-14">
      <div className="container grid md:grid-cols-3 gap-10">
        <div>
          <div className="font-display text-2xl">Dra. Gabrielle <span className="gold-text">Leão</span></div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Odontologia estética em Brasília. Sorrisos naturais, harmônicos e únicos.
          </p>
        </div>
        <div>
          <div className="font-accent text-primary text-lg">Navegação</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#servicos" className="hover:text-primary">Serviços</a></li>
            <li><a href="#resultados" className="hover:text-primary">Resultados</a></li>
            <li><a href="#sobre" className="hover:text-primary">Sobre</a></li>
            <li><a href="#contato" className="hover:text-primary">Contato</a></li>
          </ul>
        </div>
        <div>
          <div className="font-accent text-primary text-lg">Contato</div>
          <div className="mt-4 flex gap-3">
            <a href="https://instagram.com/dra.gabrielleleao" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition">
              <Instagram size={16} className="text-primary" />
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition">
              <MessageCircle size={16} className="text-primary" />
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Águas Claras e Taguatinga - DF · Brasil</p>
        </div>
      </div>
      <div className="container mt-10 pt-6 border-t border-primary/10 text-xs text-primary/60 flex flex-col md:flex-row justify-between gap-2">
        <span>© 2025 Dra. Gabrielle Leão · CRO-DF 14753</span>
        <span>Odontologia Estética · Todos os direitos reservados</span>
      </div>
    </footer>
  );
};
