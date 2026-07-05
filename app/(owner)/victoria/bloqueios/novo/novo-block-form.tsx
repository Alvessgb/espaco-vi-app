"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createScheduleBlock } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";
import type { ScheduleBlockReason } from "@prisma/client";
import { Lock, X, AlertTriangle } from "lucide-react";

const REASONS: { value: ScheduleBlockReason; label: string }[] = [
  { value: "DAY_OFF",              label: "Folga" },
  { value: "PERSONAL_COMMITMENT",  label: "Compromisso pessoal" },
  { value: "COURSE",              label: "Curso / Capacitação" },
  { value: "SPACE_MAINTENANCE",   label: "Manutenção do espaço" },
  { value: "RESERVED_TIME",       label: "Horário reservado" },
  { value: "OTHER",               label: "Outro" },
];

const TIME_OPTIONS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00",
];

const inputCls = "w-full border border-[#E0C5AC] rounded-2xl px-4 py-3.5 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] bg-[#FDFAF7]";

export function NovoBlockForm() {
  const router = useRouter();
  const [allDay, setAllDay]     = useState(true);
  const [date, setDate]         = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime]   = useState("");
  const [reason, setReason]     = useState<ScheduleBlockReason>("DAY_OFF");
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { toast.error("Informe a data"); return; }
    if (!allDay && (!startTime || !endTime)) { toast.error("Informe os horários"); return; }
    setLoading(true);
    try {
      await createScheduleBlock({ date, startTime, endTime, allDay, reason, note });
      toast.success(allDay ? "Dia bloqueado com sucesso." : "Horário bloqueado com sucesso.");
      router.push("/victoria/agenda/dia");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao bloquear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="flex-1" onClick={() => router.back()} />

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#E0C5AC] rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
            <h2 className="font-bold text-[#3D2B1F] text-base">Bloquear horário</h2>
          </div>
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center">
            <X size={16} strokeWidth={1.5} className="text-[#8B6B5A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Data */}
          <div>
            <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputCls} />
          </div>

          {/* Dia inteiro toggle */}
          <div className="flex items-center justify-between bg-[#FDFAF7] border border-[#E0C5AC] rounded-2xl px-4 py-3.5">
            <span className="text-sm font-medium text-[#3D2B1F]">Dia inteiro</span>
            <button
              type="button"
              onClick={() => setAllDay(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${allDay ? "bg-[#5F4B3C]" : "bg-[#E0C5AC]"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${allDay ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Start/End times */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Início</label>
                <select value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Fim</label>
                <select value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-2xl px-4 py-3 flex gap-2.5">
            <AlertTriangle size={16} strokeWidth={1.5} className="text-[#F9A825] shrink-0 mt-0.5" />
            <p className="text-xs text-[#856404] leading-relaxed">
              Atenção: há agendamentos neste horário. Bloqueá-lo não cancela automaticamente as clientes — entre em contato para reagendar.
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Motivo</label>
            <select value={reason} onChange={e => setReason(e.target.value as ScheduleBlockReason)} className={inputCls}>
              {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Observações (opcional)</label>
            <textarea
              rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Adicione uma nota sobre este bloqueio..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-3.5 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#3D2B1F] text-white rounded-full py-3.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              <Lock size={14} strokeWidth={1.5} />
              {loading ? "Bloqueando..." : "Bloquear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
