# Plano de Implementação: Sugestão de Mensagem com IA via N8N

## 📋 Visão Geral

Implementar um sistema que gera sugestões de mensagens personalizadas para a secretária enviar aos leads, utilizando N8N como orquestrador e uma LLM (OpenAI/Claude) para geração de texto baseada no contexto do lead.

---

## 🎯 Objetivos

1. Gerar mensagens personalizadas baseadas no histórico de conversa
2. Adaptar o tom e objetivo da mensagem conforme a etapa do funil
3. Reduzir tempo de resposta da secretária
4. Aumentar taxa de conversão com mensagens contextualizadas

---

## 🏗️ Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Supabase   │────▶│    N8N      │────▶│   OpenAI    │
│   (React)   │◀────│  Edge Func  │◀────│  Workflow   │◀────│   GPT-4     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 📦 Entregáveis

### 1. Schema de Banco de Dados

```sql
-- Tabela de mensagens do lead (se ainda não existir)
CREATE TABLE lead_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type TEXT CHECK (sender_type IN ('lead', 'bot', 'human')) NOT NULL,
    channel TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cache de sugestões geradas
CREATE TABLE ai_message_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    suggestion TEXT NOT NULL,
    stage_at_generation TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- RLS Policies
ALTER TABLE lead_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their clinic"
ON lead_messages FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
```

### 2. Supabase Edge Function

**Arquivo:** `supabase/functions/generate-message-suggestion/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

serve(async (req) => {
  const { lead_id, clinic_id } = await req.json();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Buscar dados do lead
  const { data: lead } = await supabase
    .from("leads")
    .select("*, procedures(*)")
    .eq("id", lead_id)
    .single();

  // 2. Buscar histórico de mensagens (últimas 20)
  const { data: messages } = await supabase
    .from("lead_messages")
    .select("*")
    .eq("lead_id", lead_id)
    .order("created_at", { ascending: false })
    .limit(20);

  // 3. Verificar cache
  const { data: cached } = await supabase
    .from("ai_message_suggestions")
    .select("*")
    .eq("lead_id", lead_id)
    .eq("stage_at_generation", lead.status)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (cached) {
    return new Response(JSON.stringify({ suggestion: cached.suggestion, cached: true }));
  }

  // 4. Chamar N8N webhook
  const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lead,
      messages: messages?.reverse(),
      stage: lead.status,
      procedure: lead.procedure_name
    })
  });

  const { suggestion } = await n8nResponse.json();

  // 5. Salvar no cache
  await supabase.from("ai_message_suggestions").insert({
    lead_id,
    suggestion,
    stage_at_generation: lead.status
  });

  return new Response(JSON.stringify({ suggestion, cached: false }));
});
```

### 3. Workflow N8N

**Estrutura do Workflow:**

1. **Webhook Node** (Trigger)
   - Method: POST
   - Path: `/generate-message`

2. **Set Node** (Preparar Contexto)
   - Formatar histórico de mensagens
   - Extrair informações relevantes do lead

3. **OpenAI Node** (Gerar Mensagem)
   - Model: `gpt-4-turbo` ou `gpt-3.5-turbo`
   - System Prompt: Template abaixo
   - User Prompt: Contexto formatado

4. **Respond to Webhook Node**
   - Retornar a sugestão gerada

**System Prompt Template:**

```
Você é um assistente de vendas especializado em clínicas de estética.
Sua função é criar mensagens de WhatsApp personalizadas para a secretária enviar aos leads.

REGRAS:
- Seja cordial e profissional
- Use emojis com moderação (máximo 2)
- Mensagens curtas (máximo 3 parágrafos)
- Adapte o tom conforme a etapa do funil
- Inclua uma call-to-action clara

ETAPAS E OBJETIVOS:
- Novo Lead:
- Em Qualificação:
- Qualificado:
- Orçamento: Apresentar valor e benefícios, criar urgência
- Agendado: Confirmar agendamento, reduzir no-show
- No-Show: Reengajar com empatia, oferecer remarcação
- Avaliado: Follow-up pós-consulta, apresentar proposta
- Follow Up de Vendas: Quebrar objeções, fechar venda
- Venda Realizada: Agradecer, preparar para procedimento

DADOS DO LEAD:
Nome: {{lead.name}}
Procedimento: {{lead.procedure_name}}
Etapa: {{lead.status}}
Valor estimado: {{lead.estimated_value}}

HISTÓRICO DE CONVERSA:
{{messages}}

Gere UMA mensagem pronta para copiar e colar no WhatsApp.
```

### 4. Hook React

**Arquivo:** `src/hooks/useSuggestedMessage.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SuggestionResult {
  suggestion: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  cached: boolean;
}

export function useSuggestedMessage(leadId: string, enabled: boolean = true): SuggestionResult {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchSuggestion = useCallback(async () => {
    if (!leadId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-message-suggestion',
        { body: { lead_id: leadId } }
      );

      if (fnError) throw fnError;

      setSuggestion(data.suggestion);
      setCached(data.cached);
    } catch (err) {
      setError('Erro ao gerar sugestão de mensagem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [leadId, enabled]);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  return { suggestion, loading, error, refetch: fetchSuggestion, cached };
}
```

### 5. Atualização do Componente

**Arquivo:** `src/pages/LeadDetailsPage.tsx` (trecho a modificar)

```tsx
// Adicionar import
import { useSuggestedMessage } from '@/hooks/useSuggestedMessage';

// Dentro do componente, após verificar se lead existe
const isAdvancedStage = ['orcamento', 'agendado', 'no_show', 'avaliado', 'follow_up', 'venda realizada'].includes(lead.status);
const { suggestion, loading, error, refetch, cached } = useSuggestedMessage(lead.id, isAdvancedStage);

// Substituir o card fixo pelo dinâmico
{loading ? (
  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
  </div>
) : suggestion ? (
  <div className="bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/10 rounded-lg p-4 relative">
    <p className="text-sm text-slate-700 leading-relaxed">{suggestion}</p>
    {cached && (
      <span className="absolute top-2 right-2 text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
        ⚡ Cache
      </span>
    )}
  </div>
) : (
  // Fallback para mensagem fixa atual
)}
```

---

## 🔐 Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# N8N
N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/xxx

# OpenAI (no N8N)
OPENAI_API_KEY=sk-xxx
```

---

## 📅 Cronograma Sugerido

| Fase | Tarefa | Estimativa |
|------|--------|------------|
| 1 | Criar tabelas no Supabase | 30 min |
| 2 | Implementar Edge Function | 2 horas |
| 3 | Configurar workflow N8N | 2 horas |
| 4 | Criar hook useSuggestedMessage | 1 hora |
| 5 | Integrar no LeadDetailsPage | 1 hora |
| 6 | Testes e ajustes de prompt | 2 horas |

**Total estimado:** 8-9 horas de desenvolvimento

---

## ✅ Checklist de Implementação

- [ ] Criar tabela `lead_messages` no Supabase
- [ ] Criar tabela `ai_message_suggestions` no Supabase
- [ ] Implementar RLS policies
- [ ] Deploy da Edge Function
- [ ] Configurar workflow N8N
- [ ] Testar webhook N8N isoladamente
- [ ] Implementar hook `useSuggestedMessage`
- [ ] Atualizar componente LeadDetailsPage
- [ ] Ajustar prompt da LLM com feedback real
- [ ] Monitorar custos de API da OpenAI

---

## 💡 Melhorias Futuras

1. **Múltiplas sugestões**: Gerar 3 opções para a secretária escolher
2. **Feedback loop**: Rastrear qual sugestão foi usada e se converteu
3. **Templates por procedimento**: Prompts específicos por tipo de tratamento
4. **Análise de sentimento**: Detectar leads frustrados e adaptar tom
5. **Integração direta com WhatsApp**: Enviar a mensagem sem precisar copiar/colar
