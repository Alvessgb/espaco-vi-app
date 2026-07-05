/**
 * Studio configuration — single source of truth for all business-specific values.
 * To adapt this template for another salon, only this file (and .env) need to change.
 */
export const config = {
  // Identity
  studioName: "Espaço Vi",
  studioTagline: "Studio de Beleza",
  siteDescription:
    "Agende seus procedimentos de cílios, sobrancelhas e pele com Victoria Aragão.",

  // Owner / admin
  adminEmail: process.env.ADMIN_EMAIL ?? "victoria@espacovi.com.br",

  // Payments (PIX)
  pixKey: "65.025.945/0001-03",
  pixKeyType: "CNPJ" as const,
  pixRecipientName: "Victoria Aragão Soares — PicPay",

  // WhatsApp (country code + number, no spaces or symbols)
  whatsapp: "5585992446390",

  // Booking fee in BRL cents (R$30,00 = 3000)
  bookingFeeCents: Number(process.env.BOOKING_FEE_AMOUNT ?? 3000),
} as const;

export type Config = typeof config;
