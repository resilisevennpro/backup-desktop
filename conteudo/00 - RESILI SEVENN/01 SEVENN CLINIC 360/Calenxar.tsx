import { useState, useEffect, useMemo } from "react";
import { ChatList, type Contact } from "@/components/chat/ChatList";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { Loader2, CircleDollarSign, TrendingUp, Sparkles } from "lucide-react";
import moment from "moment";

// --- ENRICHED DUMMY DATA ---
const MOCK_CONTACTS: Contact[] = [
    {
        id: '1',
        name: 'Ana Cláudia Silva',
        lastMessage: 'Gostaria de saber o valor do Botox',
        time: '14:30',
        unread: 2,
        channel: 'whatsapp',
        status: 'online',
        ai_active: true,
        sentiment: 'interested',
        stage: 'Avaliação',
        ai_messages: 12,
        human_messages: 2,
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        conversation_status: 'open'
    },
    {
        id: '2',
        name: 'João Pedro Alves',
        lastMessage: 'Vou ver com minha esposa e retorno.',
        time: 'Ontem',
        unread: 0,
        channel: 'whatsapp',
        status: 'offline',
        ai_active: true,
        sentiment: 'doubting',
        stage: 'Follow-up',
        ai_messages: 8,
        human_messages: 4,
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        conversation_status: 'open'
    },
    {
        id: '3',
        name: 'Marina Ruy Barbosa',
        lastMessage: 'Amei o resultado! Obrigada.',
        time: 'Segunda',
        unread: 0,
        channel: 'instagram',
        status: 'offline',
        ai_active: false,
        sentiment: 'interested',
        stage: 'Pós-Venda',
        ai_messages: 15,
        human_messages: 1,
        avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
        conversation_status: 'closed'
    },
    {
        id: '4',
        name: 'Carlos Oliveira',
        lastMessage: 'Tem horário para amanhã?',
        time: '10:15',
        unread: 1,
        channel: 'whatsapp',
        status: 'online',
        ai_active: true,
        sentiment: 'booking',
        stage: 'Agendamento',
        ai_messages: 4,
        human_messages: 0,
        avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708c',
        conversation_status: 'open'
    },
    {
        id: '5',
        name: 'Priscila Almeida',
        lastMessage: 'Não gostei do atendimento anterior.',
        time: '11:00',
        unread: 0,
        channel: 'whatsapp',
        status: 'online',
        ai_active: false,
        sentiment: 'angry',
        stage: 'Suporte',
        ai_messages: 2,
        human_messages: 10,
        avatar: 'https://i.pravatar.cc/150?u=a04258114e29026709d',
        conversation_status: 'open'
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    '1': [
        { id: '1', text: 'Olá, bom dia! Gostaria de saber mais sobre o Botox.', sender: 'user', timestamp: '14:28', status: 'read' },
        { id: '2', text: 'Olá Ana! Tudo bem? Sou a assistente virtual da Sevenn. O Botox é um dos nossos procedimentos mais procurados. Gostaria de agendar uma avaliação gratuita?', sender: 'ai', timestamp: '14:29', status: 'read' },
        { id: '3', text: 'Gostaria de saber o valor do Botox', sender: 'user', timestamp: '14:30', status: 'delivered' },
    ],
};

export default function ChatPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setContacts(MOCK_CONTACTS);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!selectedContact) return;
        const contactMessages = MOCK_MESSAGES[selectedContact.id] || [];
        setMessages(contactMessages);
    }, [selectedContact?.id]);

    const stats = useMemo(() => {
        const totalAiMsgs = contacts.reduce((acc, curr) => acc + (curr.ai_messages || 0), 0);
        const aiAgendamentos = contacts.filter(c => c.stage === 'Agendamento').length;
        const leadsQualificados = contacts.filter(c => c.sentiment === 'interested' || c.sentiment === 'booking').length;

        const hoursSaved = (totalAiMsgs * 1.5) / 60;
        const moneySaved = hoursSaved * 25;

        return {
            totalAiMsgs,
            aiAgendamentos,
            leadsQualificados,
            moneySaved,
            aiActivePercent: Math.round((contacts.filter(c => c.ai_active).length / (contacts.length || 1)) * 100) || 0
        };
    }, [contacts]);

    const handleSendMessage = (text: string) => {
        if (!selectedContact) return;
        const newMessage: Message = {
            id: Math.random().toString(),
            text,
            sender: 'me',
            timestamp: moment().format('HH:mm'),
            status: 'sent'
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleToggleAi = () => {
        if (!selectedContact) return;
        const newState = !selectedContact.ai_active;
        const updatedContact: Contact = { ...selectedContact, ai_active: newState };
        setSelectedContact(updatedContact);
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));

        const systemMsg: Message = {
            id: Math.random().toString(),
            text: newState ? "🤖 IA Ativada pelo operador." : "🛑 IA Pausada pelo operador.",
            sender: 'system',
            timestamp: moment().format('HH:mm'),
            status: 'read'
        };
        setMessages(prev => [...prev, systemMsg]);
    };

    const handleResolveConversation = () => {
        if (!selectedContact) return;
        const isCurrentlyClosed = selectedContact.conversation_status === 'closed';
        const newStatus = isCurrentlyClosed ? 'open' : 'closed';

        const updatedContact: Contact = { ...selectedContact, conversation_status: newStatus };
        setSelectedContact(updatedContact);
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));

        const systemMsg: Message = {
            id: Math.random().toString(),
            text: newStatus === 'closed' ? "✅ Conversa marcada como RESOLVIDA." : "🔄 Conversa REABERTA.",
            sender: 'system',
            timestamp: moment().format('HH:mm'),
            status: 'read'
        };
        setMessages(prev => [...prev, systemMsg]);
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
            <div className="px-4 py-2 border-b bg-muted/20 backdrop-blur-sm flex items-center justify-between gap-4 h-14 shrink-0">
                <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Status IA</p>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">ONLINE <span className="text-[10px] font-normal text-muted-foreground ml-1">({stats.aiActivePercent}% ativas)</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                        <TrendingUp className="w-4 h-4 text-zinc-400" />
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Agendamentos</p>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{stats.aiAgendamentos} <span className="text-[10px] font-normal text-muted-foreground">hoje</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Leads Qualificados</p>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{stats.leadsQualificados} <span className="text-[10px] font-normal text-muted-foreground">detectados</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4 text-zinc-400" />
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Economia Est.</p>
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.moneySaved)}
                                <span className="text-[10px] font-normal text-muted-foreground ml-1">(1.0h/human)</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <ChatList
                    contacts={contacts}
                    selectedId={selectedContact?.id || null}
                    onSelect={setSelectedContact}
                />
                <ChatWindow
                    contact={selectedContact}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isAiActive={!!selectedContact?.ai_active}
                    onToggleAi={handleToggleAi}
                    onResolveConversation={handleResolveConversation}
                />
            </div>
        </div>
    );
}
