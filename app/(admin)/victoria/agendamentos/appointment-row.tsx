"use client";

import { useState, useTransition } from "react";
import {
  User, Calendar, Clock, ChevronDown, ChevronUp,
  Trash2, RefreshCw, CalendarRange, Loader2,
} from "lucide-react";
import {
  updateAppointmentStatusAdmin,
  deleteAppointment,
  rescheduleAppointment,
} from "@/lib/admin-actions";
import type { AppointmentStatus } from "@prisma/client";

interface ApptData {
  id: string;
  status: string;
  notes: string | null;
  startTime: string;
  durationMinutes: number;
  totalPriceInCents: number;
  user: { id: string; name: string | null; email: string; phone: string | null };
  procedures: { name: string; priceInCents: number }[];
  paymentStatus: string | null;
  paidAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Aguardando taxinha", color: "bg-[#FFF3CD] text-[#856404]" },
  CONFIRMED:       { label: "Confirmado",         color: "bg-green-50 text-green-700" },
  COMPLETED:       { label: "Realizado",            color: "bg-blue-50 text-blue-700" },
  CANCELLED:       { label: "Cancelado",           color: "bg-gray-100 text-gray-500" },
  RESCHEDULED:     { label: "Reagendado",          color: "bg-blue-50 text-blue-700" },
  NO_SHOW:         { label: "Não realizado",        color: "bg-red-50 text-red-600" },
};

const ALL_STATUSES: AppointmentStatus[] = [
  "PENDING_PAYMENT","CONFIRMED","COMPLETED","CANCELLED","RESCHEDULED","NO_SHOW",
];

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function fmtDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return h === 0 ? `${m}min` : m === 0 ? `${h}h` : `${h}h ${m}min`;
}

// Today in YYYY-MM-DD (local) — min date for rescheduling
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

interface Slot { time: string; available: boolean }

export function AppointmentRow({ appointment: a }: { appointment: ApptData }) {
  const [open, setOpen]                   = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [slots, setSlots]                   = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);
  const [selectedSlot, setSelectedSlot]     = useState("");
  const [isPending, startTransition]        = useTransition();
  const [msg, setMsg]                       = useState<{ text: string; ok: boolean } | null>(null);

  const cfg = STATUS_CONFIG[a.status] ?? { label: a.status, color: "bg-gray-100 text-gray-500" };
  const date = new Date(a.startTime);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }

  function handleStatusChange(status: AppointmentStatus) {
    startTransition(async () => {
      const res = await updateAppointmentStatusAdmin(a.id, status);
      if (res.error) flash(res.error, false);
      else { flash("Status atualizado.", true); setChangingStatus(false); }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteAppointment(a.id);
      if (res.error) flash(res.error, false);
      else flash("Agendamento removido.", true);
    });
  }

  async function handleDateChange(dateVal: string) {
    setRescheduleDate(dateVal);
    setSelectedSlot("");
    setSlots([]);
    if (!dateVal) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/available-slots?date=${dateVal}&duration=${a.durationMinutes}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      flash("Erro ao buscar horários.", false);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleReschedule() {
    if (!rescheduleDate || !selectedSlot) return;
    const isoStr = `${rescheduleDate}T${selectedSlot}:00`;
    startTransition(async () => {
      const res = await rescheduleAppointment(a.id, isoStr);
      if (res.error) flash(res.error, false);
      else {
        flash("Reagendado com sucesso!", true);
        setRescheduleMode(false);
        setRescheduleDate("");
        setSelectedSlot("");
        setSlots([]);
      }
    });
  }

  const availableSlots = slots.filter(s => s.available);

  return (
    <div className="bg-white rounded-2xl border border-[#E0C5AC] shadow-sm overflow-hidden">
      {/* Summary row */}
      <button className="w-full flex items-start gap-3 px-4 py-4 text-left" onClick={() => setOpen(v => !v)}>
        <div className="w-10 h-10 rounded-full bg-[#E0C5AC] flex items-center justify-center shrink-0 mt-0.5">
          <User size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-[#3D2B1F] text-sm truncate">{a.user.name ?? a.user.email}</p>
            <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-[#8B6B5A]">
            <span className="flex items-center gap-1"><Calendar size={11} strokeWidth={1.5} />{dateStr}</span>
            <span className="flex items-center gap-1"><Clock size={11} strokeWidth={1.5} />{timeStr} · {fmtDuration(a.durationMinutes)}</span>
          </div>
          <p className="text-xs text-[#C4A080] mt-0.5 truncate">{a.procedures.map(p => p.name).join(", ")}</p>
        </div>
        {open
          ? <ChevronUp size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-1" />
          : <ChevronDown size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-1" />}
      </button>

      {/* Detail */}
      {open && (
        <div className="border-t border-[#F5EBE0] px-4 pb-4 pt-3 flex flex-col gap-3">
          {/* Cliente */}
          <div className="bg-[#F5EBE0] rounded-xl p-3 flex flex-col gap-1">
            <p className="text-xs font-bold text-[#3D2B1F]">Cliente</p>
            <p className="text-xs text-[#5F4B3C]">{a.user.email}</p>
            {a.user.phone && <p className="text-xs text-[#5F4B3C]">{a.user.phone}</p>}
          </div>

          {/* Procedimentos + total */}
          <div className="flex flex-col gap-1">
            {a.procedures.map((p, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-[#5F4B3C]">{p.name}</span>
                <span className="font-medium text-[#3D2B1F]">{fmt(p.priceInCents)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs font-bold border-t border-[#F5EBE0] pt-1.5 mt-0.5">
              <span className="text-[#3D2B1F]">Total</span>
              <span className="text-[#5F4B3C]">{fmt(a.totalPriceInCents)}</span>
            </div>
          </div>

          {/* Pagamento */}
          <div className="flex flex-wrap gap-2 text-xs">
            {a.paymentStatus && (
              <span className="bg-[#F5EBE0] text-[#5F4B3C] px-3 py-1.5 rounded-full">
                Pagamento: {a.paymentStatus === "PAID"
                  ? `✅ Pago${a.paidAt ? ` em ${new Date(a.paidAt).toLocaleDateString("pt-BR")}` : ""}`
                  : a.paymentStatus}
              </span>
            )}
            {a.notes === "PAYMENT_SENT" && (
              <span className="bg-[#FFF3CD] text-[#856404] px-3 py-1.5 rounded-full">📨 Comprovante enviado</span>
            )}
            <span className="bg-[#F5EBE0] text-[#8B6B5A] px-3 py-1.5 rounded-full">
              Criado em {new Date(a.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>

          {/* Alterar status */}
          {changingStatus && (
            <div className="bg-[#F5EBE0] rounded-xl p-3 flex flex-col gap-2">
              <p className="text-xs font-bold text-[#3D2B1F]">Alterar status</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={isPending || s === a.status}
                    className={`text-xs py-2 px-3 rounded-full border font-medium transition-colors disabled:opacity-40 ${
                      s === a.status
                        ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                        : "border-[#E0C5AC] text-[#5F4B3C] hover:bg-[#E0C5AC]"
                    }`}
                  >
                    {STATUS_CONFIG[s]?.label ?? s}
                  </button>
                ))}
              </div>
              <button onClick={() => setChangingStatus(false)} className="text-xs text-[#8B6B5A] underline self-start">Cancelar</button>
            </div>
          )}

          {/* Remarcar */}
          {rescheduleMode && (
            <div className="bg-[#F5EBE0] rounded-xl p-3 flex flex-col gap-3">
              <p className="text-xs font-bold text-[#3D2B1F]">Remarcar agendamento</p>

              {/* Date picker */}
              <div>
                <label className="text-[10px] text-[#8B6B5A] uppercase tracking-wide font-medium block mb-1">Nova data</label>
                <input
                  type="date"
                  min={todayStr()}
                  value={rescheduleDate}
                  onChange={e => handleDateChange(e.target.value)}
                  className="w-full bg-white border border-[#E0C5AC] rounded-xl px-3 py-2.5 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]"
                />
              </div>

              {/* Slots */}
              {rescheduleDate && (
                <div>
                  <label className="text-[10px] text-[#8B6B5A] uppercase tracking-wide font-medium block mb-1">Horário disponível</label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-xs text-[#8B6B5A] py-2">
                      <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
                      Buscando horários…
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-[#8B6B5A] py-1">Nenhum horário disponível nessa data.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      {availableSlots.map(s => (
                        <button
                          key={s.time}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            selectedSlot === s.time
                              ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                              : "bg-white border-[#E0C5AC] text-[#5F4B3C] hover:bg-[#E0C5AC]"
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm / Cancel */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !selectedSlot || isPending}
                  className="flex-1 bg-[#3D2B1F] text-white rounded-full py-2.5 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 size={12} strokeWidth={2} className="animate-spin" />}
                  Confirmar reagendamento
                </button>
                <button
                  onClick={() => { setRescheduleMode(false); setRescheduleDate(""); setSelectedSlot(""); setSlots([]); }}
                  className="px-4 border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-2.5 text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Apagar confirm */}
          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-xs font-bold text-red-700">Apagar este agendamento permanentemente?</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={isPending} className="flex-1 bg-red-600 text-white rounded-full py-2 text-xs font-bold disabled:opacity-50">
                  {isPending ? "Apagando…" : "Confirmar"}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-red-200 text-red-600 rounded-full py-2 text-xs font-medium">Cancelar</button>
              </div>
            </div>
          )}

          {/* Ações principais */}
          {!changingStatus && !confirmDelete && !rescheduleMode && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setChangingStatus(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F5EBE0] text-[#5F4B3C] rounded-full text-xs font-medium hover:bg-[#E0C5AC] transition-colors"
              >
                <RefreshCw size={12} strokeWidth={1.5} />Alterar status
              </button>
              <button
                onClick={() => setRescheduleMode(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                <CalendarRange size={12} strokeWidth={1.5} />Remarcar
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 size={12} strokeWidth={1.5} />Apagar
              </button>
            </div>
          )}

          {msg && (
            <p className={`text-xs font-medium px-3 py-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
