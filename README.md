# Espaço Vi App

App de agendamentos para o **Espaço Vi** — estúdio de estética de Victoria Aragão.

## Tech stack

- **Framework:** Next.js 16+ App Router (TypeScript strict)
- **Styling:** Tailwind CSS v4 + custom design system
- **ORM:** Prisma 6 + PostgreSQL (Neon)
- **Auth:** Auth.js v5 — Google OAuth + Resend magic link
- **Payments:** Stripe (booking fee R$30)
- **Emails:** Resend
- **Component explorer:** Storybook

## Running locally

```bash
# 1. Clone
git clone https://github.com/Alvessgb/espaco-vi-app
cd espaco-vi-app

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, STRIPE_*, RESEND_API_KEY, etc.

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Seed procedures
npm run db:seed

# 7. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/procedimentos` | Public procedure catalog |
| `/procedimentos/[slug]` | Procedure detail |
| `/carrinho` | Cart |
| `/agendar` | Date/time selection |
| `/checkout` | Stripe checkout |
| `/login` | Auth (Google / magic link) |
| `/conta` | Client account |
| `/meus-agendamentos` | Client appointments |
| `/meus-agendamentos/[id]` | Appointment detail |
| `/victoria` | Admin redirect |
| `/victoria/agenda/dia` | Daily agenda |
| `/victoria/agenda/semana` | Weekly agenda |
| `/victoria/agenda/mes` | Monthly calendar |
| `/victoria/painel` | Operations dashboard |
| `/victoria/procedimentos` | Procedure management |
| `/victoria/bloqueios` | Schedule blocks |

## Storybook

```bash
npm run storybook
```
