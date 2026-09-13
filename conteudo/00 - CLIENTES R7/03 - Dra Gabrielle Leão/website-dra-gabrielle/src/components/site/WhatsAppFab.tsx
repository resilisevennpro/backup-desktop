import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";

export const WhatsAppFab = () => (
  <a
    href={WHATSAPP_LINK}
    target="_blank" rel="noreferrer"
    aria-label="Falar no WhatsApp"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-gold-strong animate-pulse-glow hover:scale-110 transition-transform"
  >
    <MessageCircle size={26} />
  </a>
);
