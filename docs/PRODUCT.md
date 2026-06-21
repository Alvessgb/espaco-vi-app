# Espaço Vi — Produto

## O que é

O Espaço Vi é um estúdio de estética especializado conduzido por Victoria Aragão. O app centraliza o agendamento de procedimentos estéticos, eliminando trocas de mensagens e garantindo que Victoria tenha visibilidade total da sua agenda.

## Jornada da cliente

1. **Descoberta** — A cliente acessa `/procedimentos` e navega pelo catálogo organizado por categorias (Cílios, Sobrancelhas, Pele, etc.)
2. **Seleção** — Adiciona um ou mais procedimentos ao carrinho
3. **Agendamento** — Escolhe data e horário disponível (o sistema mostra apenas slots com duração suficiente)
4. **Pagamento** — Paga a taxa de reserva de R$30 via Stripe Checkout
5. **Confirmação** — Recebe e-mail de confirmação; o agendamento entra como CONFIRMED
6. **Acompanhamento** — Acessa `/meus-agendamentos` para ver próximos e histórico
7. **Atendimento** — No dia, a taxa de R$30 é abatida do valor total
8. **Avaliação** — Após o atendimento, recebe e-mail para deixar review

## Status do agendamento

| Status | Descrição |
|---|---|
| `PENDING_PAYMENT` | Aguardando pagamento da taxa |
| `CONFIRMED` | Taxa paga, horário garantido |
| `COMPLETED` | Atendimento realizado |
| `CANCELLED` | Cancelado pela cliente ou Victoria |
| `NO_SHOW` | Cliente não compareceu |
| `RESCHEDULED` | Reagendado |

## Fluxos da Victoria

### Agenda do dia
- Acessa `/victoria/agenda/dia`
- Vê todos os atendimentos do dia, ordenados por horário
- Vê nome da próxima cliente e status do pagamento
- Navega entre dias com setas prev/next

### Agenda da semana
- Visão geral com contagem por dia
- Clica em um dia para ver os atendimentos inline

### Agenda do mês
- Calendário completo com indicadores visuais:
  - Verde: tem atendimentos
  - Vermelho: dia bloqueado
  - Cinza: dia passado
- Clica no dia para ir para a agenda do dia

### Painel de operações
- Contadores: próximos, hoje, concluídos no mês, receita de taxas, cancelamentos
- Top 5 procedimentos mais agendados
- 5 reviews mais recentes

### Gerenciamento de procedimentos
- Visualiza todos os procedimentos (inclusive removidos)
- Filtra por categoria, status, busca por nome
- Cria e edita procedimentos com todos os campos
- Remove com modal de confirmação que avisa sobre agendamentos futuros

### Bloqueios de agenda
- Lista todos os bloqueios futuros
- Cria bloqueios de horário ou dia inteiro
- O sistema verifica conflito com agendamentos confirmados antes de bloquear
- Bloqueados não aparecem como disponíveis para as clientes
