"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { AppointmentRow } from "./appointment-row";

type SortKey = "createdAt_desc" | "createdAt_asc" | "startTime_desc" | "startTime_asc";
type StatusFilter = "ALL" | "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

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

const STATUS_LABELS: Record<StatusFilter, string> = {
  ALL:             "Todos",
  PENDING_PAYMENT: "Aguardando taxinha",
  CONFIRMED:       "Confirmados",
  COMPLETED:       "Concluídos",
  CANCELLED:       "Cancelados",
};

export function AgendamentosClient({ appointments }: { appointments: ApptData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt_desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "createdAt_desc",  label: "Criado mais recente" },
    { value: "createdAt_asc",   label: "Criado mais antigo" },
    { value: "startTime_desc",  label: "Agendamento mais recente" },
    { value: "startTime_asc",   label: "Agendamento mais próximo" },
  ];

  const countByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of appointments) map[a.status] = (map[a.status] ?? 0) + 1;
    return map;
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = appointments.filter(a => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (a.user.name ?? "").toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q) ||
        (a.user.phone ?? "").includes(q) ||
        a.procedures.some(p => p.name.toLowerCase().includes(q))
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "createdAt_desc")  return new Date(b.createdAt).getTime()  - new Date(a.createdAt).getTime();
      if (sort === "createdAt_asc")   return new Date(a.createdAt).getTime()  - new Date(b.createdAt).getTime();
      if (sort === "startTime_desc")  return new Date(b.startTime).getTime()  - new Date(a.startTime).getTime();
      if (sort === "startTime_asc")   return new Date(a.startTime).getTime()  - new Date(b.startTime).getTime();
      return 0;
    });

    return list;
  }, [appointments, query, sort, statusFilter]);

  const statusTabs = (["ALL", "PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED"] as StatusFilter[]);

  return (
    <main className="px-4 pt-5 pb-24 max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="font-bold text-[#3D2B1F] text-lg">Agendamentos</h1>
        <p className="text-xs text-[#8B6B5A] mt-0.5">
          {filtered.length} de {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + sort */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E0C5AC] rounded-xl px-3 py-2.5">
          <Search size={14} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail, procedimento..."
            className="flex-1 text-sm text-[#3D2B1F] outline-none bg-transparent placeholder:text-[#C4A080]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#8B6B5A]">
              <X size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#E0C5AC] rounded-xl px-3 py-2.5 shrink-0">
          <ArrowUpDown size={13} strokeWidth={1.5} className="text-[#8B6B5A]" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="text-xs text-[#5F4B3C] outline-none bg-transparent font-medium cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {statusTabs.map(s => {
          const isActive = statusFilter === s;
          const count = s === "ALL"
            ? appointments.length
            : (countByStatus[s] ?? 0);
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                  : "bg-white text-[#5F4B3C] border-[#E0C5AC] hover:bg-[#F5EBE0]"
              }`}
            >
              {STATUS_LABELS[s]}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isActive ? "bg-white/20 text-white" : "bg-[#F5EBE0] text-[#5F4B3C]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0C5AC] p-8 text-center">
          <p className="text-sm text-[#8B6B5A]">
            {query ? `Nenhum resultado para "${query}"` : "Nenhum agendamento neste filtro."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(appt => (
            <AppointmentRow key={appt.id} appointment={appt} />
          ))}
        </div>
      )}
    </main>
  );
}
