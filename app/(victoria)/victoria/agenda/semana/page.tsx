import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

function getTuesdayOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const diff = day <= 2 ? 2 - day : -(day - 2) + 7;
  const tuesday = new Date(d);
  tuesday.setDate(d.getDate() - (day === 2 ? 0 : (day < 2 ? day - 2 + 7 : day - 2)));
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
}

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  const offset = day === 0 ? -5 : day === 1 ? -6 : 2 - day;
  // Start week on Tuesday
  const tuesday = new Date(d);
  // find the most recent Tuesday
  const dow = d.getDay(); // 0=Sun
  const diffToTue = (dow - 2 + 7) % 7;
  tuesday.setDate(d.getDate() - diffToTue);
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
  void offset;
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

export default async function AgendaSemanaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { week, day } = await searchParams;
  const weekStart = parseParam(week); // Tuesday
  const weekEnd = addDays(weekStart, 4);
  weekEnd.setHours(23, 59, 59, 999);

  const appointments = await db.appointment.findMany({
    where: {
      startTime: { gte: weekStart, lte: weekEnd },
      status: { notIn: ["CANCELLED"] },
    },
    include: { user: { select: { name: true } }, procedures: true },
    orderBy: { startTime: "asc" },
  });

  // Count per day
  const countByDay: Record<string, number> = {};
  for (const a of appointments) {
    const k = fmtParam(a.startTime);
    countByDay[k] = (countByDay[k] ?? 0) + 1;
  }

  const maxCount = Math.max(1, ...Object.values(countByDay));

  // Selected day
  const selectedDateStr = day ?? fmtParam(new Date());
  const dayAppts = appointments.filter(a => fmtParam(a.startTime) === selectedDateStr);
  const selectedDate = new Date(selectedDateStr + "T00:00:00");

  const prevWeek = fmtParam(addDays(weekStart, -7));
  const nextWeek = fmtParam(addDays(weekStart, 7));

  return (
    <main className="px-4 pt-5 pb-10 max-w-lg mx-auto">
      {/* Week day bubbles */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {WEEK_DAYS.map(({ label, offset }) => {
          const dayDate = addDays(weekStart, offset);
          const dateStr = fmtParam(dayDate);
          const count = countByDay[dateStr] ?? 0;
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
              <span className={`text-xl font-bold leading-none ${isSelected ? "text-white" : "text-[#3D2B1F]"} ${isToday && !isSelected ? "text-[#5F4B3C]" : ""}`}>
                {dayDate.getDate()}
              </span>
              <div className="flex gap-0.5 mt-0.5 h-2">
                {count > 0 ? Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                  <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/60" : "bg-[#5F4B3C]"}`} />
                )) : <span className="w-1 h-1 rounded-full bg-transparent" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Carga da semana bar chart */}
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

      {/* Week nav prev/next */}
      <div className="flex gap-2 mb-4">
        <Link href={`/victoria/agenda/semana?week=${prevWeek}&day=${fmtParam(addDays(new Date(prevWeek + "T00:00:00"), 0))}`}
          className="flex-1 text-center bg-white border border-[#E0C5AC] rounded-xl py-2 text-sm text-[#8B6B5A]">← Semana anterior</Link>
        <Link href={`/victoria/agenda/semana?week=${nextWeek}&day=${fmtParam(addDays(new Date(nextWeek + "T00:00:00"), 0))}`}
          className="flex-1 text-center bg-white border border-[#E0C5AC] rounded-xl py-2 text-sm text-[#8B6B5A]">Próxima →</Link>
      </div>

      {/* Selected day appointments */}
      <div>
        <h2 className="font-bold text-[#3D2B1F] text-base mb-3">
          {selectedDate.toLocaleDateString("pt-BR", { weekday: "short" })} · {selectedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} · {dayAppts.length} atendimento{dayAppts.length !== 1 ? "s" : ""}
        </h2>

        {dayAppts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#E0C5AC] p-6 text-center">
            <p className="text-[#8B6B5A] text-sm">Nenhum atendimento neste dia.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayAppts.map(appt => (
              <div key={appt.id} className="bg-white rounded-2xl border border-[#E0C5AC] p-4 flex gap-4 shadow-sm">
                <div className="shrink-0 w-14">
                  <p className="font-bold text-[#3D2B1F] text-sm">
                    {appt.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#3D2B1F] text-sm leading-tight">{appt.user.name}</p>
                  <p className="text-xs text-[#8B6B5A] mt-0.5">
                    {appt.procedures.map(p => p.name).join(" · ")} · {appt.durationMinutes} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
