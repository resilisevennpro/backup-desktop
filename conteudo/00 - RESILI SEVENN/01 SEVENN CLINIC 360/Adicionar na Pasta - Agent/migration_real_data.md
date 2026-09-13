# Briefing: Migração de Dados Mock para Dados Reais (Supabase)

Este documento guia a transição completa do sistema de agendamento para uso exclusivo do banco de dados Supabase, removendo dependências de dados estáticos de teste.

## 1. Contexto Atual
Atualmente, o sistema opera de forma híbrida em alguns componentes: tenta buscar dados do Supabase, mas possui *fallbacks* para constantes `MOCK_DATA` se a conexão falhar ou retornar vazio.

## 2. Pontos de Atenção e Arquivos Afetados

### A. Modal de Agendamento (`AddAppointmentModal.tsx`)
- **Status Atual**: Possui constantes `MOCK_LEADS`, `MOCK_SERVICES`, `MOCK_PROFESSIONALS`. No `catch` do `fetchDropdowns`, ele reverte para esses mocks.
- **Ação Necessária**: 
    1. Remover as constantes de Mock.
    2. Remover a lógica de fallback no `catch`.
    3. **Otimização de Leads**: Atualmente carrega *todos* os leads. Para produção real, implementar busca no banco conforme o usuário digita (Server-side Search) para evitar carregar milhares de registros.

### B. Página do Calendário (`Calendar.tsx`)
- **Status Atual**: Verifica se a busca de eventos traz dados reais.
- **Ação Necessária**: Garantir que o range de datas (start/end) do `BigCalendar` esteja sendo passado corretamente para a query do Supabase, carregando apenas os agendamentos do mês/semana visível.

### C. Componentes de Configuração
- Modais como `ProfessionalModal`, `ServiceModal` já aparentam estar integrados, mas vale uma revisão final para garantir que não há dados "hardcoded" na inicialização.

## 3. Melhorias de Performance Sugeridas
- **Leads**: Substituir o filtro local (`leads.filter(...)`) por query dinâmica: `.ilike('name', %${searchTerm}%)`.
- **Cache**: Implementar `React Query` ou similar para evitar requests repetidos de Profissionais e Serviços, que mudam pouco.

---

## 4. Prompt para Execução Futura

Copie e cole o prompt abaixo quando quiser realizar essa migração:

```text
Olá! Vamos realizar a migração definitiva dos dados Mock para Dados Reais (Supabase) no módulo de Agendamento.

Siga o roteiro baseando-se no briefing criado anteriormente:

1. **Limpeza de Mocks**:
   - Vá em `src/components/calendar/AddAppointmentModal.tsx` e remova todas as constantes `MOCK_LEADS`, `MOCK_SERVICES`, etc.
   - Remova o fallback para esses mocks no bloco `catch` da função `fetchDropdowns`. O sistema deve alertar erro de conexão se falhar, não usar dados falsos.

2. **Otimização de Busca de Pacientes**:
   - No `AddAppointmentModal.tsx`, altere a lógica de busca de pacientes.
   - Em vez de baixar todos os leads e filtrar localmente, faça a busca no Supabase disparar apenas quando o usuário digitar no campo "Paciente" (debounce de 500ms).
   - Query sugerida: `supabase.from('leads').select('*').ilike('name', '%termo%').limit(20)`.

3. **Validação do Calendário**:
   - Verifique `src/pages/Calendar.tsx` e garanta que `appointments` venham exclusivamente do Supabase.

Por favor, execute essas alterações focando na integridade dos dados e performance.
```
