"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { updateAppointmentStatusAdmin } from "@/lib/admin-actions";

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED:       "Confirmado",
  PENDING_PAYMENT: "Pendente",
  COMPLETED:       "Realizado",
  CANCELLED:       "Cancelado",
  NO_SHOW:         "Não realizado",
  RESCHEDULED:     "Reagendado",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED:       "bg-[#D8F3DC] text-[#2D6A4F]",
  PENDING_PAYMENT: "bg-[#FFF3CD] text-[#856404]",
  COMPLETED:       "bg-blue-50 text-blue-700",
  CANCELLED:       "bg-red-100 text-red-700",
  NO_SHOW:         "bg-gray-100 text-gray-600",
  RESCHEDULED:     "bg-blue-50 text-blue-700",
};

import { fmtDuration } from "@/lib/format";

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export interface AgendaAppt {
  id: string;
  status: string;
  durationMinutes: number;
  totalPriceInCents: number;
  user: { name: string | null };
  procedures: { name: string }[];
  payment: { status: string } | null;
}

export function AgendaAppointmentCard({ time, appt }: { time: string; appt: AgendaAppt }) {
  const [status, setStatus] = useState(appt.status);
  const [isPending, startTransition] = useTransition();

  function changeStatus(newStatus: "COMPLETED" | "NO_SHOW") {
    startTransition(async () => {
      const res = await updateAppointmentStatusAdmin(appt.id, newStatus);
      if (!res.error) setStatus(newStatus);
    });
  }

  const isDone = status === "COMPLETED" || status === "NO_SHOW" || status === "CANCELLED";

  return (
    <div className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm">
      <div className="flex gap-3">
        {/* Horário + duração */}
        <div className="shrink-0 w-12 pt-0.5">
          <p className="font-bold text-[#3D2B1F] text-sm">{time}</p>
          <p className="text-[11px] text-[#8B6B5A] mt-0.5">{fmtDuration(appt.durationMinutes)}</p>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Nome + status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-[#3D2B1F] text-sm leading-tight truncate">{appt.user.name}</p>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>

          {/* Procedimentos */}
          <p className="text-xs text-[#8B6B5A] mb-2 leading-snug">
            {appt.procedures.map(p => p.name).join(" · ")}
          </p>

          {/* Taxa + valor + botões */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${appt.payment?.status === "PAID" ? "bg-[#D8F3DC] text-[#2D6A4F]" : "bg-[#FFF3CD] text-[#856404]"}`}>
              {appt.payment?.status === "PAID" ? "Taxa paga" : "Taxa pendente"}
            </span>
            <span className="text-xs font-bold text-[#5F4B3C]">{fmt(appt.totalPriceInCents)}</span>

            {!isDone && (
              <div className="flex gap-1.5 ml-auto shrink-0">
                <button
                  onClick={() => changeStatus("COMPLETED")}
                  disabled={isPending}
                  title="Atendimento realizado"
                  className="w-7 h-7 rounded-full bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center hover:bg-[#2D6A4F] hover:text-white transition-colors disabled:opacity-40"
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => changeStatus("NO_SHOW")}
                  disabled={isPending}
                  title="Cliente não compareceu"
                  className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
