"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateScheduleBlock } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";
import type { ScheduleBlockReason } from "@prisma/client";
import { Lock, X, AlertTriangle } from "lucide-react";

const REASONS: { value: ScheduleBlockReason; label: string }[] = [
  { value: "DAY_OFF",             label: "Folga" },
  { value: "PERSONAL_COMMITMENT", label: "Compromisso pessoal" },
  { value: "COURSE",             label: "Curso / Capacitação" },
  { value: "SPACE_MAINTENANCE",  label: "Manutenção do espaço" },
  { value: "RESERVED_TIME",      label: "Horário reservado" },
  { value: "OTHER",              label: "Outro" },
];

const TIME_OPTIONS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30",
];

const inputCls = "w-full border border-[#E0C5AC] rounded-2xl px-4 py-3.5 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] bg-[#FDFAF7]";

interface Props {
  id: string;
  initialDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialAllDay: boolean;
  initialReason: ScheduleBlockReason;
  initialNote: string;
}

export function EditBlockForm({
  id, initialDate, initialStartTime, initialEndTime,
  initialAllDay, initialReason, initialNote,
}: Props) {
  const router = useRouter();
  const [allDay, setAllDay]       = useState(initialAllDay);
  const [date, setDate]           = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime]     = useState(initialEndTime);
  const [reason, setReason]       = useState<ScheduleBlockReason>(initialReason);
  const [note, setNote]           = useState(initialNote);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { toast.error("Informe a data"); return; }
    if (!allDay && (!startTime || !endTime)) { toast.error("Informe os horários"); return; }
    setLoading(true);
    try {
      const res = await updateScheduleBlock(id, { date, startTime, endTime, allDay, reason, note });
      if (res.error) { toast.error(res.error); return; }
      toast.success("Bloqueio atualizado.");
      router.push("/victoria/bloqueios");
    } catch {
      toast.error("Erro ao atualizar bloqueio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0] flex flex-col justify-end">
      <div className="flex-1" onClick={() => router.back()} />
      <div className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#E0C5AC] rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
            <h2 className="font-bold text-[#3D2B1F] text-base">Editar bloqueio</h2>
          </div>
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center">
            <X size={16} strokeWidth={1.5} className="text-[#8B6B5A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputCls} />
          </div>

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

          <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-2xl px-4 py-3 flex gap-2.5">
            <AlertTriangle size={16} strokeWidth={1.5} className="text-[#F9A825] shrink-0 mt-0.5" />
            <p className="text-xs text-[#856404] leading-relaxed">
              Alterar o bloqueio não afeta agendamentos existentes — entre em contato com as clientes se necessário.
            </p>
          </div>

          <div>
            <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Motivo</label>
            <select value={reason} onChange={e => setReason(e.target.value as ScheduleBlockReason)} className={inputCls}>
              {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#8B6B5A] font-medium mb-1.5">Observações (opcional)</label>
            <textarea
              rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Adicione uma nota sobre este bloqueio..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-3.5 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#3D2B1F] text-white rounded-full py-3.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              <Lock size={14} strokeWidth={1.5} />
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
