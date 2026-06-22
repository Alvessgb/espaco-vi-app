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
