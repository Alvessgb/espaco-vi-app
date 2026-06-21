import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendBookingConfirmationToClient, sendNewBookingToVictoria } from "@/lib/email";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getStripeInstance(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2026-02-25.clover" as any,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeInstance().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointmentId;
    if (appointmentId) {
      await db.payment.update({
        where: { appointmentId },
        data: {
          status: "PAID",
          stripeSessionId: session.id,
          stripePaymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          paidAt: new Date(),
        },
      });
      await db.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
      });

      // Send confirmation emails
      try {
        const appt = await db.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            user: { select: { name: true, email: true } },
            procedures: true,
          },
        });

        if (appt && appt.user.email) {
          const date = appt.startTime.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const time = appt.startTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const services = appt.procedures.map((p) => p.name);

          await Promise.all([
            sendBookingConfirmationToClient({
              to: appt.user.email,
              name: appt.user.name ?? "Cliente",
              date,
              time,
              services,
              totalDuration: appt.durationMinutes,
              totalPrice: appt.totalPriceInCents,
            }),
            sendNewBookingToVictoria({
              clientName: appt.user.name ?? "Cliente",
              date,
              time,
              services,
              totalDuration: appt.durationMinutes,
            }),
          ]);
        }
      } catch (emailErr) {
        // Don't fail the webhook if email fails
        console.error("Failed to send confirmation emails:", emailErr);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointmentId;
    if (appointmentId) {
      await db.payment.update({
        where: { appointmentId },
        data: { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
