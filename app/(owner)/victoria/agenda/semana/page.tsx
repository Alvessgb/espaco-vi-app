import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Lock, Pencil } from "lucide-react";
import { fmtDuration } from "@/lib/format";
import { AgendaAppointmentCard } from "../agenda-card";
import { UnblockButton } from "../unblock-button";

function getWeekStart(d: Date): Date {
  const dow = d.getDay();
  const diffToTue = (dow - 2 + 7) % 7;
  const tuesday = new Date(d);
  tuesday.setDate(d.getDate() - diffToTue);
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function fmtParam(d: Date) { return d.toISOString().split("T")[0]; }

function parseParam(w?: string): Date {
  if (w) {
    const p = new Date(w + "T00:00:00");
    if (!isNaN(p.getTime())) return getWeekStart(p);
  }
  return getWeekStart(new Date());
}

const WEEK_DAYS = [
  { label: "Ter", offset: 0 },
  { label: "Qua", offset: 1 },
  { label: "Qui", offset: 2 },
  { label: "Sex", offset: 3 },
  { label: "Sáb", offset: 4 },
];

const BLOCK_REASON_LABEL: Record<string, string> = {
  DAY_OFF: "Folga",
  PERSONAL_COMMITMENT: "Compromisso pessoal",
  COURSE: "Curso / Capacitação",
  MAINTENANCE: "Manutenção",
  SPACE_MAINTENANCE: "Manutenção do espaço",
  RESERVED_TIME: "Horário reservado",
  VACATION: "Férias",
  OTHER: "Bloqueio",
};

const BIZ_START = 9 * 60;
const BIZ_END   = 18 * 60 + 30;

export default async function AgendaSemanaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { week, day } = await searchParams;
  const weekStart = parseParam(week);
  const weekEnd = addDays(weekStart, 4);
  weekEnd.setHours(23, 59, 59, 999);

  const [appointments, scheduleBlocksRaw] = await Promise.all([
    db.appointment.findMany({
      where: {
        startTime: { gte: weekStart, lte: weekEnd },
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        user: { select: { name: true } },
        procedures: true,
        payment: true,
      },
      orderBy: { startTime: "asc" },
    }),
    db.scheduleBlock.findMany({
      where: { startTime: { gte: weekStart, lte: weekEnd } },
      orderBy: { startTime: "asc" },
    }),
  ]);

  // Serialise appointments
  const serialised = appointments.map(a => ({
    id: a.id,
    status: a.status as string,
    durationMinutes: a.durationMinutes,
    totalPriceInCents: a.totalPriceInCents,
    user: { name: a.user.name },
    procedures: a.procedures.map(p => ({ name: p.name })),
    payment: a.payment ? { status: a.payment.status as string } : null,
    dateKey: fmtParam(a.startTime),
    timeStr: `${String(a.startTime.getHours()).padStart(2, "0")}:${String(a.startTime.getMinutes()).padStart(2, "0")}`,
  }));

  // Serialise schedule blocks
  const serialisedBlocks = scheduleBlocksRaw.map(b => {
    const isFullDay = b.type === "FULL_DAY";
    return {
      id: b.id,
      dateKey: fmtParam(b.startTime),
      timeStr: isFullDay ? "09:00" : `${String(b.startTime.getHours()).padStart(2, "0")}:${String(b.startTime.getMinutes()).padStart(2, "0")}`,
      startMinutes: isFullDay ? BIZ_START : b.startTime.getHours() * 60 + b.startTime.getMinutes(),
      durationMinutes: isFullDay ? BIZ_END - BIZ_START : Math.round((b.endTime.getTime() - b.startTime.getTime()) / 60000),
      reason: BLOCK_REASON_LABEL[b.reason] ?? b.reason,
      note: b.note,
      isFullDay,
    };
  });

  const countByDay: Record<string, number> = {};
  for (const a of serialised) {
    countByDay[a.dateKey] = (countByDay[a.dateKey] ?? 0) + 1;
  }
  const hasBlockByDay: Record<string, boolean> = {};
  for (const b of serialisedBlocks) {
    hasBlockByDay[b.dateKey] = true;
  }

  const maxCount = Math.max(1, ...Object.values(countByDay));

  const selectedDateStr = day ?? fmtParam(new Date());
  const dayAppts = serialised
    .filter(a => a.dateKey === selectedDateStr)
    .sort((a, b) => a.timeStr.localeCompare(b.timeStr));
  const dayBlocks = serialisedBlocks
    .filter(b => b.dateKey === selectedDateStr)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Merge appointments + blocks into a sorted timeline for the selected day
  type DayItem =
    | { kind: "appt"; timeStr: string; data: typeof dayAppts[0] }
    | { kind: "block"; timeStr: string; data: typeof dayBlocks[0] };

  const dayItems: DayItem[] = [
    ...dayAppts.map(a => ({ kind: "appt" as const, timeStr: a.timeStr, data: a })),
    ...dayBlocks.map(b => ({ kind: "block" as const, timeStr: b.timeStr, data: b })),
  ].sort((a, b) => a.timeStr.localeCompare(b.timeStr));

  const selectedDate = new Date(selectedDateStr + "T00:00:00");

  const prevWeek = fmtParam(addDays(weekStart, -7));
  const nextWeek = fmtParam(addDays(weekStart, 7));

  return (
    <main className="px-4 pt-5 pb-10 max-w-lg mx-auto">
      {/* Day bubbles */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {WEEK_DAYS.map(({ label, offset }) => {
          const dayDate = addDays(weekStart, offset);
          const dateStr = fmtParam(dayDate);
          const count = countByDay[dateStr] ?? 0;
          const hasBlock = hasBlockByDay[dateStr] ?? false;
          const isSelected = selectedDateStr === dateStr;
          const isToday = dateStr === fmtParam(new Date());

          return (
            <Link
              key={offset}
              href={`/victoria/agenda/semana?week=${fmtParam(weekStart)}&day=${dateStr}`}
              className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 rounded-2xl py-3 px-2 transition-colors ${
                isSelected ? "bg-[#3D2B1F] text-white" : "bg-white border border-[#E0C5AC] text-[#8B6B5A]"
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? "text-white/70" : "text-[#8B6B5A]"}`}>{label}</span>
              <span className={`text-xl font-bold leading-none ${isSelected ? "text-white" : isToday ? "text-[#5F4B3C]" : "text-[#3D2B1F]"}`}>
                {dayDate.getDate()}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5 h-2">
                {count > 0
                  ? Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                      <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/60" : "bg-[#5F4B3C]"}`} />
                    ))
                  : null}
                {hasBlock && (
                  <Lock size={8} strokeWidth={2} className={isSelected ? "text-white/60" : "text-[#C4A080]"} />
                )}
                {!count && !hasBlock && <span className="w-1 h-1 rounded-full bg-transparent" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Barra de carga semanal */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-4 mb-4 shadow-sm">
        <p className="text-sm font-bold text-[#3D2B1F] mb-3">Carga da semana</p>
        <div className="flex items-end gap-2 h-14">
          {WEEK_DAYS.map(({ label, offset }) => {
            const dateStr = fmtParam(addDays(weekStart, offset));
            const count = countByDay[dateStr] ?? 0;
            const pct = count / maxCount;
            const isSelected = selectedDateStr === dateStr;
            return (
              <div key={offset} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg flex items-end" style={{ height: "44px" }}>
                  <div
                    className={`w-full rounded-lg transition-all ${isSelected ? "bg-[#3D2B1F]" : "bg-[#E0C5AC]"}`}
                    style={{ height: `${Math.max(pct * 100, count > 0 ? 20 : 5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#8B6B5A]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navegação semana */}
      <div className="flex gap-2 mb-4">
        <Link
          href={`/victoria/agenda/semana?week=${prevWeek}&day=${fmtParam(addDays(new Date(prevWeek + "T00:00:00"), 0))}`}
          className="flex-1 text-center bg-white border border-[#E0C5AC] rounded-xl py-2 text-sm text-[#8B6B5A]"
        >← Semana anterior</Link>
        <Link
          href={`/victoria/agenda/semana?week=${nextWeek}&day=${fmtParam(addDays(new Date(nextWeek + "T00:00:00"), 0))}`}
          className="flex-1 text-center bg-white border border-[#E0C5AC] rounded-xl py-2 text-sm text-[#8B6B5A]"
        >Próxima →</Link>
      </div>

      {/* Atendimentos + bloqueios do dia selecionado */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#3D2B1F] text-base">
            {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
            {" · "}{dayAppts.length} atendimento{dayAppts.length !== 1 ? "s" : ""}
            {dayBlocks.length > 0 && ` · ${dayBlocks.length} bloqueio${dayBlocks.length !== 1 ? "s" : ""}`}
          </h2>
          <Link
            href="/victoria/bloqueios/novo"
            className="flex items-center gap-1 bg-[#F5EBE0] border border-[#E0C5AC] rounded-full px-3 py-1.5 text-xs font-semibold text-[#5F4B3C]"
          >
            <Lock size={11} strokeWidth={2} />
            Bloquear
          </Link>
        </div>

        {dayItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#E0C5AC] p-6 text-center">
            <p className="text-[#8B6B5A] text-sm">Nenhum atendimento neste dia.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dayItems.map((item, i) =>
              item.kind === "appt" ? (
                <AgendaAppointmentCard key={i} time={item.data.timeStr} appt={item.data} />
              ) : (
                <div key={i} className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm">
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0 w-12 pt-0.5">
                      <p className="font-bold text-[#3D2B1F] text-sm">{item.data.timeStr}</p>
                      <p className="text-[11px] text-[#8B6B5A] mt-0.5">{fmtDuration(item.data.durationMinutes)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <Lock size={12} strokeWidth={2} className="text-[#8B6B5A] shrink-0 mt-0.5" />
                          <p className="font-bold text-[#3D2B1F] text-sm leading-tight">{item.data.reason}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/victoria/bloqueios/${item.data.id}/editar`}
                            className="w-7 h-7 rounded-full bg-[#F5EBE0] flex items-center justify-center hover:bg-[#E0C5AC] transition-colors"
                            title="Editar bloqueio"
                          >
                            <Pencil size={12} strokeWidth={1.5} className="text-[#5F4B3C]" />
                          </Link>
                          <UnblockButton id={item.data.id} />
                        </div>
                      </div>
                      {item.data.note && <p className="text-xs text-[#8B6B5A] mt-0.5 pl-[18px]">{item.data.note}</p>}
                      <span className="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBE0] text-[#8B6B5A]">
                        {item.data.isFullDay ? "Dia inteiro bloqueado" : "Horário bloqueado"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
