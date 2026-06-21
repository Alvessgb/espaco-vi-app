"use server";

import { filtrarSlotsDisponiveis } from "@/lib/scheduling";

export async function getSlotsForDate(
  dateStr: string,
  totalDurationMinutes: number
): Promise<{ time: string; available: boolean }[]> {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return [];

  // Skip Sundays (0) and Mondays (1) — Espaço Vi: Ter–Sáb
  if (date.getDay() === 0 || date.getDay() === 1) return [];

  return filtrarSlotsDisponiveis(date, totalDurationMinutes);
}
