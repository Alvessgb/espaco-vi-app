# Espaço Vi App — Plataforma de Agendamento

## Stack
- **Framework:** Next.js 16+ App Router (TypeScript strict)
- **Estilização:** Tailwind CSS 4 + Design System próprio (`components/ds/`)
- **ORM:** Prisma ^6 + PostgreSQL (Neon)
- **Auth:** Auth.js v5 (NextAuth) — Google OAuth + Resend magic link
- **Pagamentos:** Stripe (taxa de R$30 por agendamento, modo `payment`, não `subscription`)
- **Emails:** Resend
- **Data fetching:** TanStack Query
- **Validação:** Zod
- **Notificações:** Sonner

## Regras importantes

### Middleware
Nunca importar `auth` do Auth.js no middleware — estoura 1MB no Vercel free.
Checar cookie `authjs.session-token` diretamente.
Rotas protegidas: `/agendamentos`, `/perfil`, `/admin`

### Prisma
Usar Prisma ^6. Provider: `prisma-client-js`, datasource usa `env("DATABASE_URL")`.

### Stripe
Usar `2026-02-25.clover` como apiVersion.
Modo `payment` (não subscription) — R$30 de taxa de agendamento.
Taxa é abatida do valor final no dia do atendimento.
Lazy init do client Stripe para não crashar no build.

### Toast
Usar `sonner` diretamente (não shadcn toast).

### Tailwind v4
- Usar `@theme inline { }` em `globals.css`
- NUNCA usar `--spacing-*` tokens no `@theme`
- Tokens: apenas colors, fonts, radii
- Poppins via `next/font/google`

## Paleta de cores
- `#5F4B3C` — Marrom principal (texto, botões primários)
- `#E0C5AC` — Nude (borders, badges, chips inativos)
- `#F5EBE0` — Bege claro (background geral)
- `#FFFFFF` — Branco (cards)
- `#4CAF50` — Verde (sucesso/confirmado)
- `#E53935` — Vermelho (erro/cancelado)
- `#F9A825` — Amarelo (aviso/pendente)

## Roles
- `CUSTOMER` — cliente padrão
- `ADMIN` — Victoria (pode ver painel admin, editar procedimentos, bloquear agenda)

## Estrutura de pastas
- `app/(public)/` — Landing, login, procedimentos (catálogo público)
- `app/(auth)/` — App protegido (agendamentos, perfil)
- `app/admin/` — Painel da Victoria (protegido por role ADMIN)
- `app/api/` — Route handlers
- `lib/` — auth, db, stripe, email, utils
- `components/ds/` — Design system próprio
- `components/providers/` — QueryProvider
- `prisma/schema.prisma` — Schema completo

## Entidades principais
- `User` — auth + role (CUSTOMER | ADMIN)
- `ProcedureCategory` — categorias (Cílios, Sobrancelhas, Pele…)
- `Procedure` — procedimentos com preço, duração, imagens
- `Appointment` — agendamento com status
- `AppointmentProcedure` — procedimentos no agendamento
- `ScheduleBlock` — bloqueios de agenda (folga, manutenção…)
- `Payment` — taxa de R$30 via Stripe
- `Review` — avaliação pós-atendimento

## Fluxo de agendamento
1. Cliente seleciona procedimentos → `CartSummary` mostra total
2. Cliente escolhe data/hora disponível (`CalendarSlot`)
3. Pagamento da taxa R$30 via Stripe Checkout
4. Webhook confirma → `Appointment.status = CONFIRMED`
5. Email de confirmação enviado via Resend
6. Dia do atendimento → `COMPLETED` + taxa abatida do valor final

## Admin (Victoria)
- Ver agenda do dia/semana
- Confirmar/cancelar/reagendar appointments
- Bloquear horários (`ScheduleBlock`)
- Gerenciar procedimentos (CRUD)
- Dashboard com métricas (`AdminStatCard`)
