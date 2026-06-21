# Deploy — Vercel

## 1. Conecte o repositório

1. Acesse [vercel.com](https://vercel.com)
2. New Project → Import `espaco-vi-app`
3. Framework: Next.js (auto-detectado)

## 2. Configure as variáveis de ambiente

No painel do projeto → Settings → Environment Variables, adicione:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=
AUTH_URL=https://seu-dominio.vercel.app
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
RESEND_API_KEY=
AUTH_RESEND_KEY=
EMAIL_FROM=Espaço Vi <noreply@seudominio.com>
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
ADMIN_EMAIL=victoria@espacovi.com.br
BOOKING_FEE_AMOUNT=3000
```

## 3. Deploy

Clique em Deploy. O build roda `prisma generate && next build`.

## 4. Configure o Stripe Webhook (produção)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://seu-dominio.vercel.app/api/stripe/webhook`
3. Events: selecione `checkout.session.completed` e `checkout.session.expired`
4. Copie o Signing secret (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`

## 5. Configure o Google OAuth (produção)

1. Google Cloud Console → Credentials → seu OAuth client
2. Authorized redirect URIs: adicione `https://seu-dominio.vercel.app/api/auth/callback/google`

## 6. Configure domínio customizado (opcional)

Vercel → Settings → Domains → Add Domain

## 7. Banco de dados (Neon)

O Neon suporta conexões serverless nativamente. Nenhuma configuração extra necessária além da `DATABASE_URL`.

Para executar o seed em produção:
```bash
DATABASE_URL=<prod-url> npx prisma db push
DATABASE_URL=<prod-url> npm run db:seed
```

## Troubleshooting

- **Build falha com erro de Prisma:** verifique que `DATABASE_URL` está configurado corretamente
- **Auth não funciona:** verifique `AUTH_SECRET` e `AUTH_URL`
- **Stripe webhook retorna 400:** verifique `STRIPE_WEBHOOK_SECRET`
- **Emails não chegam:** verifique `RESEND_API_KEY` e que o domínio está verificado no Resend
