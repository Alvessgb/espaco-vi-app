# Espaço Vi App — Instruções para Claude Code

## Identidade visual
Manter sempre: brown #5F4B3C, nude #E0C5AC, fundo #F5EBE0, Poppins
Não usar: azul, cores saturadas, estética SaaS/corporativa

## Regras de negócio
- Agendamento só confirma após taxa de R$30 paga via Stripe
- Taxa de R$30 é abatida no valor final no dia do atendimento
- Múltiplos procedimentos somam duração total
- Agenda só exibe slots compatíveis com duração total
- Cliente não vê agenda de outras clientes
- Cliente não vê motivos de bloqueio
- /victoria e /admin apenas para ADMIN role
- Procedimento removido não aparece para novas clientes
- Agendamentos confirmados não são cancelados ao remover procedimento

## Desenvolvimento
- Toda alteração deve passar em: npm run build + npx tsc --noEmit
- Mobile-first obrigatório
- Nunca transformar em marketplace genérico de beleza
- Nunca subir .env para GitHub

## Stack
Next.js 16+ App Router, TypeScript strict, Tailwind CSS v4, Prisma 6, Auth.js v5, Stripe, Resend, Vercel, Neon

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
- `app/(public)/` — Landing, login, catalog, cart, scheduling
- `app/(auth)/` — Protected client area (conta, meus-agendamentos)
- `app/(victoria)/victoria/` — Admin area (agenda, painel, bloqueios, procedimentos)
- `app/api/` — Route handlers (auth, checkout, stripe webhook)
- `lib/` — auth, db, stripe, email, actions, admin-actions, scheduling
- `components/ds/` — Design system components
- `prisma/schema.prisma` — Full database schema

## Middleware
Nunca importar `auth` do Auth.js no middleware — estoura 1MB no Vercel free.
Checar cookie `authjs.session-token` diretamente.

## Stripe
Usar `2026-02-25.clover` como apiVersion.
Modo `payment` (não subscription) — R$30 de taxa de agendamento.
Lazy init do client Stripe para não crashar no build.

## Toast
Usar `sonner` diretamente (não shadcn toast).

## Tailwind v4
- Usar `@theme inline { }` em `globals.css`
- NUNCA usar `--spacing-*` tokens no `@theme`
- Tokens: apenas colors, fonts, radii
