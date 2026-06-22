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
