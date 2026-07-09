import { db } from "@/lib/db";

export const BUSINESS_HOURS = { start: 9, end: 19 }; // hours (local time) — Ter–Sáb
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
  const { start, end } = BUSINESS_HOURS;

  for (let hour = start; hour < end; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, min, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + totalDurationMinutes);

      // Slot must finish by end of business
      const endOfDay = new Date(date);
      endOfDay.setHours(end, 0, 0, 0);
      if (slotEnd > endOfDay) break;

      slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
  }

  return slots;
}

export async function verificarConflito(
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const count = await db.appointment.count({
    where: {
      status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
      startTime: { lt: endTime },
      endTime:   { gt: startTime },
    },
  });
  return count > 0;
}

export async function filtrarSlotsDisponiveis(
  date: Date,
  totalDurationMinutes: number
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

    const conflict = await verificarConflito(slotStart, slotEnd);
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
