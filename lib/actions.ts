"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function createUserAccount(data: {
  firstName: string; lastName: string; birthDate: string;
  phone?: string; email: string; password: string;
}): Promise<void> {
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Este e-mail já está cadastrado. Faça login.");

  const hash = await bcrypt.hash(data.password, 10);
  await db.user.create({
    data: {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: hash,
      phone: data.phone || null,
      birthDate: data.birthDate ? new Date(data.birthDate + "T00:00:00") : null,
    },
  });
}

export async function updateUserProfile(data: {
  name: string;
  phone?: string;
  birthDate?: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      phone: data.phone ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
    },
  });

  revalidatePath("/conta");
}

export async function markPaymentSent(appointmentId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/conta");

  await db.appointment.updateMany({
    where: { id: appointmentId, userId: session.user.id, status: "PENDING_PAYMENT" },
    data: { notes: "PAYMENT_SENT" },
  });

  revalidatePath("/meus-agendamentos");
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Verify ownership and CONFIRMED status
  const appt = await db.appointment.findFirst({
    where: { id: appointmentId, userId: session.user.id, status: "CONFIRMED" },
  });

  if (!appt) throw new Error("Agendamento não encontrado ou não pode ser cancelado.");

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/meus-agendamentos");
}

export async function createBookingForLoggedUser(data: {
  date: string;
  time: string;
  phone: string;
  birthDate: string;
  procedures: { id: string; name: string; priceInCents: number; durationMinutes: number }[];
}): Promise<{ appointmentId: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { appointmentId: "", error: "Sessão expirada. Faça login novamente." };

  const { validarSlotAntesDoCheckout } = await import("@/lib/scheduling");
  const [y, mo, d] = data.date.split("-").map(Number);
  const [h, m] = data.time.split(":").map(Number);
  const startTime = new Date(y, mo - 1, d, h, m, 0);
  const totalDuration = data.procedures.reduce((s, p) => s + p.durationMinutes, 0);
  const totalPriceInCents = data.procedures.reduce((s, p) => s + p.priceInCents, 0);
  const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);

  const validation = await validarSlotAntesDoCheckout(startTime, totalDuration);
  if (!validation.valid) return { appointmentId: "", error: validation.reason };

  // Update missing profile data
  await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.birthDate ? { birthDate: new Date(data.birthDate + "T00:00:00") } : {}),
    },
  });

  const appointment = await db.appointment.create({
    data: {
      userId: session.user.id,
      startTime,
      endTime,
      totalPriceInCents,
      durationMinutes: totalDuration,
      status: "PENDING_PAYMENT",
      procedures: {
        create: data.procedures.map((p) => ({
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

  return { appointmentId: appointment.id };
}
