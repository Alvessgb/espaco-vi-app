# Setup local

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta Neon (PostgreSQL serverless)
- Conta Stripe
- Conta Resend
- Conta Google Cloud (OAuth)
- GitHub CLI (`gh`)

## 1. Clone o repositório

```bash
git clone https://github.com/Alvessgb/espaco-vi-app
cd espaco-vi-app
```

## 2. Instale as dependências

```bash
npm install
```

## 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

### DATABASE_URL
Crie um banco no [Neon](https://neon.tech) e copie a connection string:
```
DATABASE_URL=postgresql://user:password@host/espaco-vi?sslmode=require
```

### AUTH_SECRET
Gere um segredo aleatório:
```bash
openssl rand -hex 32
```

### Google OAuth
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto e ative Google+ API
3. Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

```
AUTH_GOOGLE_ID=your-client-id
AUTH_GOOGLE_SECRET=your-client-secret
```

### Stripe
1. Crie conta em [Stripe](https://stripe.com)
2. Copie as chaves do Dashboard → Developers → API keys

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # ver seção abaixo
```

### Resend
1. Crie conta em [Resend](https://resend.com)
2. Dashboard → API Keys → Create API Key

```
RESEND_API_KEY=re_...
AUTH_RESEND_KEY=re_...
EMAIL_FROM=Espaço Vi <noreply@seudominio.com>
```

## 4. Prepare o banco de dados

```bash
# Gera o Prisma client
npx prisma generate

# Cria as tabelas
npx prisma db push

# Popula com procedimentos iniciais
npm run db:seed
```

## 5. Crie a Victoria como admin

Após criar uma conta normalmente no app, execute no banco:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'victoria@espacovi.com.br';
```

Ou adicione o email da Victoria em `prisma/seed.ts` e re-execute o seed.

## 6. Configure o Stripe Webhook (dev)

```bash
# Instale o Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie o `whsec_...` exibido para `STRIPE_WEBHOOK_SECRET` no `.env.local`.

## 7. Inicie o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 8. Storybook (opcional)

```bash
npm run storybook
```
