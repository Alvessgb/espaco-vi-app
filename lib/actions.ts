"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
