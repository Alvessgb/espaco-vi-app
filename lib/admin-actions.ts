"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AppointmentStatus, ProcedureStatus, ScheduleBlockReason, ScheduleBlockType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  // @ts-expect-error — role is on session.user
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function createScheduleBlock(data: {
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  reason: ScheduleBlockReason;
  note?: string;
}): Promise<void> {
  await requireAdmin();

  const dateBase = new Date(data.date + "T00:00:00");
  let start: Date;
  let end: Date;
  let type: ScheduleBlockType;

  if (data.allDay) {
    start = new Date(data.date + "T00:00:00");
    end = new Date(data.date + "T23:59:59");
    type = "FULL_DAY";
  } else {
    if (!data.startTime || !data.endTime) throw new Error("Horários obrigatórios");
    start = new Date(`${data.date}T${data.startTime}`);
    end = new Date(`${data.date}T${data.endTime}`);
    type = "TIME_RANGE";
  }

  // Check for existing confirmed appointments in that time
  const conflict = await db.appointment.findFirst({
    where: {
      status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (conflict) {
    throw new Error("Já existe um atendimento nesse horário.");
  }

  void dateBase; // silence unused warning

  await db.scheduleBlock.create({
    data: { type, reason: data.reason, note: data.note, startTime: start, endTime: end },
  });

  revalidatePath("/victoria/bloqueios");
  revalidatePath("/victoria/agenda/dia");
}

export async function deleteScheduleBlock(id: string): Promise<void> {
  await requireAdmin();

  await db.scheduleBlock.delete({ where: { id } });
  revalidatePath("/victoria/bloqueios");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  await requireAdmin();

  await db.appointment.update({ where: { id: appointmentId }, data: { status } });
  revalidatePath("/victoria/agenda/dia");
}

export async function confirmAppointmentPayment(appointmentId: string): Promise<void> {
  await requireAdmin();

  await db.$transaction([
    db.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED" },
    }),
    db.payment.updateMany({
      where: { appointmentId },
      data: { status: "PAID", paidAt: new Date() },
    }),
  ]);

  revalidatePath("/victoria/pendentes");
  revalidatePath("/victoria/agenda/dia");
}

export async function createProcedure(data: {
  categoryId: string; name: string; slug: string;
  shortDescription?: string; description?: string;
  priceInCents?: number | null; durationMinutes?: number | null;
  badge?: string; indicatedFor?: string; expectedResult?: string;
  beforeCare?: string; afterCare?: string; internalNotes?: string;
  imageUrl?: string;
}): Promise<void> {
  await requireAdmin();
  const { imageUrl, ...procedureData } = data;
  const procedure = await db.procedure.create({ data: { ...procedureData, status: "ACTIVE" } });
  if (imageUrl) {
    await db.procedureImage.create({ data: { procedureId: procedure.id, url: imageUrl, isPrimary: true, order: 0 } });
  }
  revalidatePath("/victoria/procedimentos");
  revalidatePath("/procedimentos");
}

export async function updateProcedure(
  id: string,
  data: {
    categoryId?: string; name?: string; slug?: string;
    shortDescription?: string; description?: string;
    priceInCents?: number | null; durationMinutes?: number | null;
    badge?: string; indicatedFor?: string; expectedResult?: string;
    beforeCare?: string; afterCare?: string; internalNotes?: string;
    imageUrl?: string;
  }
): Promise<void> {
  await requireAdmin();
  const { imageUrl, ...procedureData } = data;
  await db.procedure.update({ where: { id }, data: procedureData });
  if (imageUrl !== undefined) {
    const existing = await db.procedureImage.findFirst({ where: { procedureId: id } });
    if (existing) {
      await db.procedureImage.update({ where: { id: existing.id }, data: { url: imageUrl } });
    } else if (imageUrl) {
      await db.procedureImage.create({ data: { procedureId: id, url: imageUrl, isPrimary: true, order: 0 } });
    }
  }
  revalidatePath("/victoria/procedimentos");
  revalidatePath("/procedimentos");
}

export async function setProcedureStatus(
  id: string,
  status: ProcedureStatus
): Promise<void> {
  await requireAdmin();

  await db.procedure.update({ where: { id }, data: { status } });
  revalidatePath("/victoria/procedimentos");
  revalidatePath("/procedimentos");
}

// ── GESTÃO DE USUÁRIOS ──────────────────────────────────────────────────────

export async function updateUser(
  userId: string,
  data: { name?: string; email?: string; phone?: string; birthDate?: string }
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.birthDate !== undefined && {
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        }),
      },
    });
    revalidatePath("/victoria/usuarios");
    return {};
  } catch {
    return { error: "Erro ao atualizar usuário." };
  }
}

export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<{ error?: string }> {
  await requireAdmin();
  if (newPassword.length < 6) return { error: "Senha deve ter pelo menos 6 caracteres." };
  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id: userId }, data: { password: hashed } });
  revalidatePath("/victoria/usuarios");
  return {};
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    // Cancel all appointments first
    await db.appointment.updateMany({
      where: { userId, status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    });
    await db.user.delete({ where: { id: userId } });
    revalidatePath("/victoria/usuarios");
    return {};
  } catch {
    return { error: "Erro ao apagar usuário." };
  }
}

export async function updateAppointmentStatusAdmin(
  appointmentId: string,
  status: AppointmentStatus
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await db.appointment.update({ where: { id: appointmentId }, data: { status } });
    revalidatePath("/victoria/agendamentos");
    revalidatePath("/victoria/pendentes");
    return {};
  } catch {
    return { error: "Erro ao atualizar agendamento." };
  }
}

export async function deleteAppointment(appointmentId: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    // Delete dependent records that don't have onDelete: Cascade
    await db.payment.deleteMany({ where: { appointmentId } });
    await db.appointmentReview.deleteMany({ where: { appointmentId } });
    await db.appointment.delete({ where: { id: appointmentId } });
    revalidatePath("/victoria/agendamentos");
    revalidatePath("/victoria/pendentes");
    revalidatePath("/victoria/agenda/dia");
    return {};
  } catch (e) {
    console.error("deleteAppointment error:", e);
    return { error: "Erro ao apagar agendamento." };
  }
}

export async function rescheduleAppointment(
  appointmentId: string,
  newStartTimeISO: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const appt = await db.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt) return { error: "Agendamento não encontrado." };

    const newStartTime = new Date(newStartTimeISO);
    const newEndTime = new Date(newStartTime.getTime() + appt.durationMinutes * 60 * 1000);

    await db.appointment.update({
      where: { id: appointmentId },
      data: { startTime: newStartTime, endTime: newEndTime, status: "RESCHEDULED" },
    });

    revalidatePath("/victoria/agendamentos");
    revalidatePath("/victoria/agenda/dia");
    revalidatePath("/victoria/agenda/semana");
    revalidatePath("/victoria/pendentes");
    return {};
  } catch (e) {
    console.error("rescheduleAppointment error:", e);
    return { error: "Erro ao reagendar." };
  }
}
