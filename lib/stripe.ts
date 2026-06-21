import Stripe from "stripe";

// Lazy init to avoid build crash when env var is missing
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: "2026-02-25.clover" as any,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

/** Creates a one-time checkout session for the R$30 booking fee */
export async function createBookingFeeCheckoutSession({
  appointmentId,
  customerEmail,
  customerId,
}: {
  appointmentId: string;
  customerEmail: string;
  customerId?: string | null;
}) {
  const s = getStripe();

  let resolvedCustomerId = customerId;
  if (!resolvedCustomerId) {
    const customer = await s.customers.create({
      email: customerEmail,
      metadata: { appointmentId },
    });
    resolvedCustomerId = customer.id;
  }

  return s.checkout.sessions.create({
    customer: resolvedCustomerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_BOOKING_FEE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/agendamentos/${appointmentId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/agendamentos/${appointmentId}?payment=cancelled`,
    metadata: { appointmentId },
  });
}
