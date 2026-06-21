"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createScheduleBlock } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";
import type { ScheduleBlockReason } from "@prisma/client";

const REASONS: { value: ScheduleBlockReason; label: string }[] = [
  { value: "DAY_OFF", label: "Folga" },
  { value: "PERSONAL_COMMITMENT", label: "Compromisso pessoal" },
  { value: "COURSE", label: "Curso" },
  { value: "SPACE_MAINTENANCE", label: "Manutenção do espaço" },
  { value: "RESERVED_TIME", label: "Horário reservado" },
  { value: "OTHER", label: "Outro" },
];

export function NovoBlockForm() {
  const router = useRouter();
  const [allDay, setAllDay] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState<ScheduleBlockReason>("DAY_OFF");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { toast.error("Informe a data"); return; }
    if (!allDay && (!startTime || !endTime)) { toast.error("Informe os horários"); return; }

    setLoading(true);
    try {
      await createScheduleBlock({ date, startTime, endTime, allDay, reason, note });
      toast.success(allDay ? "Dia bloqueado com sucesso." : "Horário bloqueado com sucesso.");
      router.push("/victoria/bloqueios");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao bloquear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Data *</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
        />
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-4 h-4 accent-[#5F4B3C]"
        />
        <span className="font-poppins text-sm text-[#3D2B1F]">Dia inteiro</span>
      </label>

      {!allDay && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-poppins text-xs text-[#8B6B5A]">Início *</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-poppins text-xs text-[#8B6B5A]">Fim *</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Motivo *</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ScheduleBlockReason)}
          className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C] bg-white"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Observação (opcional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Detalhes opcionais..."
          className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-poppins font-medium hover:bg-[#4a3a2d] transition-colors disabled:opacity-50"
      >
        {loading ? "Bloqueando..." : "Bloquear"}
      </button>
    </form>
  );
}
