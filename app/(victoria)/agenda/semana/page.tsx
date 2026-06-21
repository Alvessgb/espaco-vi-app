import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { StatusBadge, type AppointmentStatus } from "@/components/ds/status-badge";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDateParam(d: Date) {
  return d.toISOString().split("T")[0];
}

function parseWeekParam(w?: string): Date {
  if (w) {
    const p = new Date(w + "T00:00:00");
    if (!isNaN(p.getTime())) return getMondayOfWeek(p);
  }
  return getMondayOfWeek(new Date());
}

export default async function AgendaSemanaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { week, day } = await searchParams;
  const monday = parseWeekParam(week);
  const saturday = addDays(monday, 5);
  saturday.setHours(23, 59, 59, 999);

  const selectedDay = day ? new Date(day + "T00:00:00") : null;

  const appointments = await db.appointment.findMany({
    where: {
      startTime: { gte: monday, lte: saturday },
      status: { notIn: ["CANCELLED"] },
    },
    include: { user: { select: { name: true } }, procedures: true },
    orderBy: { startTime: "asc" },
  });

  const prevWeek = formatDateParam(addDays(monday, -7));
  const nextWeek = formatDateParam(addDays(monday, 7));

  const weekLabel = `${monday.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${saturday.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl mb-5">Agenda da Semana</h1>

      {/* Week nav */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-xl border border-[#E0C5AC] px-4 py-3">
        <Link href={`/victoria/agenda/semana?week=${prevWeek}`} className="text-[#8B6B5A] hover:text-[#5F4B3C] font-bold">←</Link>
        <span className="flex-1 text-center font-poppins font-medium text-[#3D2B1F] text-sm">{weekLabel}</span>
        <Link href={`/victoria/agenda/semana?week=${nextWeek}`} className="text-[#8B6B5A] hover:text-[#5F4B3C] font-bold">→</Link>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-3 gap-2 mb-5 sm:grid-cols-6">
        {DAYS.map((label, i) => {
          const dayDate = addDays(monday, i);
          const dayStr = formatDateParam(dayDate);
          const dayAppts = appointments.filter(
            (a) => formatDateParam(a.startTime) === dayStr
          );
          const isSelected = day === dayStr;

          return (
            <Link
              key={i}
              href={`/victoria/agenda/semana?week=${formatDateParam(monday)}&day=${dayStr}`}
              className={`bg-white rounded-xl border p-3 text-center transition-colors ${
                isSelected ? "border-[#5F4B3C] bg-[#5F4B3C]/5" : "border-[#E0C5AC] hover:border-[#5F4B3C]"
              }`}
            >
              <p className="font-poppins text-xs text-[#8B6B5A]">{label}</p>
              <p className="font-poppins font-semibold text-[#3D2B1F] text-sm">
                {dayDate.getDate()}
              </p>
              <p className="font-poppins text-xs text-[#5F4B3C] mt-0.5">
                {dayAppts.length > 0 ? `${dayAppts.length} atndt` : "—"}
              </p>
              {dayAppts.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {dayAppts.slice(0, 3).map((_, j) => (
                    <span key={j} className="w-1.5 h-1.5 rounded-full bg-[#5F4B3C] inline-block" />
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Day detail */}
      {selectedDay && (() => {
        const selectedDayStr = formatDateParam(selectedDay);
        const dayAppts = appointments.filter(
          (a) => formatDateParam(a.startTime) === selectedDayStr
        );
        return (
          <div>
            <h2 className="font-poppins font-semibold text-[#3D2B1F] text-base mb-3">
              {selectedDay.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            {dayAppts.length === 0 ? (
              <p className="font-poppins text-[#8B6B5A] text-sm">Nenhum atendimento.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayAppts.map((appt) => (
                  <div key={appt.id} className="bg-white rounded-xl border border-[#E0C5AC] p-3 flex items-center justify-between">
                    <div>
                      <p className="font-poppins text-sm font-medium text-[#3D2B1F]">
                        {appt.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {appt.user.name?.split(" ")[0]}
                      </p>
                      <p className="font-poppins text-xs text-[#8B6B5A]">
                        {appt.procedures.map((p) => p.name).join(", ")}
                      </p>
                    </div>
                    <StatusBadge status={appt.status as AppointmentStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </main>
  );
}
