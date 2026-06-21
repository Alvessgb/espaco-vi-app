import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge, type AppointmentStatus } from "@/components/ds/status-badge";
import Link from "next/link";

function parseDateParam(d?: string): Date {
  if (d) {
    const parsed = new Date(d + "T00:00:00");
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function formatDateParam(d: Date) {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number) {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export default async function AgendaDiaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error — role is on session.user
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { date } = await searchParams;
  const day = parseDateParam(date);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await db.appointment.findMany({
    where: {
      startTime: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELLED"] },
    },
    include: { user: { select: { name: true } }, procedures: true, payment: true },
    orderBy: { startTime: "asc" },
  });

  const prevDay = formatDateParam(addDays(day, -1));
  const nextDay = formatDateParam(addDays(day, 1));
  const displayDate = day.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const nextAppt = appointments.find(
    (a) => a.status === "CONFIRMED" && a.startTime > new Date()
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl">Agenda do Dia</h1>
        <Link
          href="/victoria/bloqueios/novo"
          className="text-sm bg-[#5F4B3C] text-white rounded-full px-4 py-2 font-poppins hover:bg-[#4a3a2d] transition-colors"
        >
          Bloquear horário
        </Link>
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-xl border border-[#E0C5AC] px-4 py-3">
        <Link href={`/victoria/agenda/dia?date=${prevDay}`} className="text-[#8B6B5A] hover:text-[#5F4B3C] font-bold">
          ←
        </Link>
        <span className="flex-1 text-center font-poppins font-medium text-[#3D2B1F] capitalize text-sm">
          {displayDate}
        </span>
        <Link href={`/victoria/agenda/dia?date=${nextDay}`} className="text-[#8B6B5A] hover:text-[#5F4B3C] font-bold">
          →
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-white rounded-xl border border-[#E0C5AC] p-3 text-center">
          <p className="font-poppins font-bold text-2xl text-[#5F4B3C]">{appointments.length}</p>
          <p className="font-poppins text-xs text-[#8B6B5A]">atendimentos</p>
        </div>
        {nextAppt && (
          <div className="flex-2 bg-white rounded-xl border border-[#E0C5AC] p-3">
            <p className="font-poppins text-xs text-[#8B6B5A] mb-1">Próxima cliente</p>
            <p className="font-poppins font-semibold text-[#3D2B1F] text-sm">
              {nextAppt.user.name?.split(" ")[0] ?? "—"} · {nextAppt.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-poppins text-[#8B6B5A]">Nenhum atendimento neste dia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-poppins font-semibold text-[#3D2B1F] text-sm">
                    {appt.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {appt.user.name?.split(" ")[0] ?? "—"}
                  </p>
                  <p className="font-poppins text-xs text-[#8B6B5A]">{appt.durationMinutes}min</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={appt.status as AppointmentStatus} />
                  {appt.payment?.status === "PAID" && (
                    <span className="text-xs font-poppins text-[#2E7D32]">Taxa paga</span>
                  )}
                </div>
              </div>
              <ul className="flex flex-col gap-0.5">
                {appt.procedures.map((p) => (
                  <li key={p.id} className="font-poppins text-xs text-[#5F4B3C] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#E0C5AC] inline-block" />
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
