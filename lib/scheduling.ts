import { db } from "@/lib/db";

// Horário de abertura em minutos a partir de meia-noite (9:00 = 540)
// Horário de fechamento em minutos a partir de meia-noite (18:30 = 1110)
export const BUSINESS_HOURS = { startMinutes: 9 * 60, endMinutes: 18 * 60 + 30 }; // Ter–Sáb
export const MIN_ADVANCE_HOURS = 2;

export function calcularDuracaoTotal(
  procedures: { durationMinutes: number }[]
): number {
  return procedures.reduce((sum, p) => sum + p.durationMinutes, 0);
}

/** Returns "HH:MM" slots for a given day, ignoring conflicts */
export async function gerarSlotsDoDia(
  date: Date,
  totalDurationMinutes: number
): Promise<string[]> {
  const slots: string[] = [];
  const { startMinutes, endMinutes } = BUSINESS_HOURS;

  for (let cursor = startMinutes; cursor < endMinutes; cursor += 30) {
    const slotEndMinutes = cursor + totalDurationMinutes;
    // Slot must finish by closing time
    if (slotEndMinutes > endMinutes) break;

    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  return slots;
}

export async function verificarConflito(
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string,
): Promise<boolean> {
  const [apptCount, blockCount] = await Promise.all([
    db.appointment.count({
      where: {
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "RESCHEDULED"] },
        startTime: { lt: endTime },
        endTime:   { gt: startTime },
      },
    }),
    db.scheduleBlock.count({
      where: {
        startTime: { lt: endTime },
        endTime:   { gt: startTime },
      },
    }),
  ]);
  return apptCount > 0 || blockCount > 0;
}

export async function filtrarSlotsDisponiveis(
  date: Date,
  totalDurationMinutes: number,
  excludeAppointmentId?: string,
): Promise<{ time: string; available: boolean }[]> {
  const slots = await gerarSlotsDoDia(date, totalDurationMinutes);
  const now = new Date();
  const minAdvance = new Date(now.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);

  const results: { time: string; available: boolean }[] = [];

  for (const slot of slots) {
    const [h, m] = slot.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + totalDurationMinutes);

    if (slotStart < minAdvance) {
      results.push({ time: slot, available: false });
      continue;
    }

    const conflict = await verificarConflito(slotStart, slotEnd, excludeAppointmentId);
    results.push({ time: slot, available: !conflict });
  }

  return results;
}

export async function validarSlotAntesDoCheckout(
  startTime: Date,
  totalDurationMinutes: number
): Promise<{ valid: boolean; reason?: string }> {
  const now = new Date();
  const minAdvance = new Date(now.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);

  if (startTime < minAdvance) {
    return {
      valid: false,
      reason: "O agendamento precisa ser feito com pelo menos 24h de antecedência.",
    };
  }

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + totalDurationMinutes);

  const conflict = await verificarConflito(startTime, endTime);
  if (conflict) {
    return { valid: false, reason: "Esse horário não está mais disponível." };
  }

  return { valid: true };
}
