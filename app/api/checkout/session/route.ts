import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBookingFeeCheckoutSession } from "@/lib/stripe";
import { validarSlotAntesDoCheckout } from "@/lib/scheduling";

interface ProcedurePayload {
  id: string;
  name: string;
  priceInCents: number;
  durationMinutes: number;
}

interface RequestBody {
  date: string;
  time: string;
  procedures: ProcedurePayload[];
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RequestBody = await req.json();
  const { date, time, procedures } = body;

  if (!date || !time || !procedures?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Parse start time
  const [y, mo, d] = date.split("-").map(Number);
  const [h, m] = time.split(":").map(Number);
  const startTime = new Date(y, mo - 1, d, h, m, 0);

  const totalDuration = procedures.reduce((s, p) => s + p.durationMinutes, 0);
  const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);
  const totalPriceInCents = procedures.reduce((s, p) => s + p.priceInCents, 0);

  // Validate slot
  const validation = await validarSlotAntesDoCheckout(startTime, totalDuration);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.reason }, { status: 409 });
  }

  // Create appointment + payment in DB
  const appointment = await db.appointment.create({
    data: {
      userId: session.user.id,
      startTime,
      endTime,
      totalPriceInCents,
      durationMinutes: totalDuration,
      status: "PENDING_PAYMENT",
      procedures: {
        create: procedures.map((p) => ({
          procedureId: p.id,
          name: p.name,
          priceInCents: p.priceInCents,
          durationMinutes: p.durationMinutes,
        })),
      },
      payment: {
        create: {
          amountInCents: 3000,
          status: "PENDING",
        },
      },
    },
  });

  // Demo mode: skip Stripe if no secret key configured
  if (!process.env.STRIPE_SECRET_KEY) {
    await db.appointment.update({
      where: { id: appointment.id },
      data: { status: "CONFIRMED" },
    });
    await db.payment.update({
      where: { appointmentId: appointment.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    return NextResponse.json({ url: `/agendamento-confirmado?appointmentId=${appointment.id}` });
  }

  // Create Stripe session
  const stripeSession = await createBookingFeeCheckoutSession({
    appointmentId: appointment.id,
    customerEmail: session.user.email!,
  });

  // Store stripe session ID
  await db.payment.update({
    where: { appointmentId: appointment.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return NextResponse.json({ url: stripeSession.url });
}
