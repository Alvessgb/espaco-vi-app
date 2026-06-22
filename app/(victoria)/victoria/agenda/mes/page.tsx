import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

function parseMonthParam(m?: string): { year: number; month: number } {
  if (m) {
    const [y, mo] = m.split("-").map(Number);
    if (y && mo) return { year: y, month: mo - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function fmtMonthParam(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(cents / 100);
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default async function AgendaMesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const [appointments, blocks, revenue] = await Promise.all([
    db.appointment.findMany({
      where: { startTime: { gte: firstDay, lte: lastDay }, status: { notIn: ["CANCELLED"] } },
      select: { id: true, startTime: true },
    }),
    db.scheduleBlock.findMany({
      where: { startTime: { gte: firstDay, lte: lastDay } },
      select: { startTime: true, type: true },
    }),
    db.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: firstDay, lte: lastDay } },
      _sum: { amountInCents: true },
    }),
  ]);

  const apptByDay: Record<number, number> = {};
  for (const a of appointments) {
    const d = a.startTime.getDate();
    apptByDay[d] = (apptByDay[d] ?? 0) + 1;
  }
  const blockedDays = new Set<number>();
  for (const b of blocks) {
    if (b.type === "FULL_DAY") blockedDays.add(b.startTime.getDate());
  }

  const taxasTotal = revenue._sum.amountInCents ?? 0;
  const totalProcedures = appointments.length;

  const daysInMonth = lastDay.getDate();
  const today = new Date();

  // Sunday-first calendar: get offset from Sunday
  // Mockup shows D S T Q Q S S (Dom Seg Ter Qua Qui Sex Sáb)
  const startDow = firstDay.getDay(); // 0=Sun

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const DOW_LABELS = ["D","S","T","Q","Q","S","S"];

  return (
    <main className="px-4 pt-5 pb-10 max-w-lg mx-auto">
      {/* Calendar card */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm mb-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/victoria/agenda/mes?month=${fmtMonthParam(prevYear, prevMonth)}`}
            className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#5F4B3C] font-bold text-sm"
          >
            ‹
          </Link>
          <h2 className="font-bold text-[#3D2B1F] text-base capitalize">
            {MONTH_NAMES[month]} {year}
          </h2>
          <Link
            href={`/victoria/agenda/mes?month=${fmtMonthParam(nextYear, nextMonth)}`}
            className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#5F4B3C] font-bold text-sm"
          >
            ›
          </Link>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DOW_LABELS.map((d, i) => (
            <div key={i} className="text-center text-xs text-[#8B6B5A] py-1 font-medium">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDate = new Date(year, month, dayNum);
            const isToday = dayDate.toDateString() === today.toDateString();
            const isBlocked = blockedDays.has(dayNum);
            const count = apptByDay[dayNum] ?? 0;
            const dow = dayDate.getDay();
            const isWeekend = dow === 0; // Sunday only (Sat is open)
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

            let bgClass = "bg-transparent";
            let textClass = "text-[#3D2B1F]";
            let countClass = "text-[#8B6B5A]";

            if (isBlocked) {
              bgClass = "bg-[#F5EBE0]";
              textClass = "text-[#C4A080]";
            } else if (isWeekend) {
              textClass = "text-[#C4A080]";
            } else if (count >= 5) {
              bgClass = "bg-[#3D2B1F]";
              textClass = "text-white";
              countClass = "text-white/70";
            } else if (count >= 3) {
              bgClass = "bg-[#E0C5AC]";
              textClass = "text-[#3D2B1F]";
              countClass = "text-[#5F4B3C]";
            } else if (count >= 1) {
              bgClass = "bg-[#F5EBE0]";
              textClass = "text-[#3D2B1F]";
              countClass = "text-[#8B6B5A]";
            }

            return (
              <Link
                key={dayNum}
                href={`/victoria/agenda/dia?date=${dateStr}`}
                className={`rounded-xl py-2 px-1 flex flex-col items-center gap-0.5 min-h-[52px] justify-center transition-all hover:opacity-80 ${bgClass} ${isToday ? "ring-2 ring-[#5F4B3C]" : ""}`}
              >
                <span className={`text-sm font-semibold leading-none ${textClass}`}>{dayNum}</span>
                {isBlocked ? (
                  <span className="text-xs text-[#C4A080]">🔒</span>
                ) : count > 0 ? (
                  <span className={`text-[10px] font-medium ${countClass}`}>{count}x</span>
                ) : (
                  <span className="text-[10px] text-[#E0C5AC]">·</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap px-1 mb-4">
        <LegendItem color="bg-[#3D2B1F]" label="Lotado" />
        <LegendItem color="bg-[#E0C5AC]" label="Movimentado" />
        <LegendItem color="bg-[#F5EBE0] border border-[#E0C5AC]" label="Leve" />
        <LegendItem color="bg-[#F5EBE0] border border-[#E0C5AC]" label="Bloqueado" icon="🔒" />
      </div>

      {/* Revenue card */}
      <div className="bg-[#3D2B1F] rounded-2xl p-5">
        <p className="text-white/60 text-xs mb-1">Receita do mês ({MONTH_NAMES[month]})</p>
        <p className="text-white font-bold text-3xl mb-1">{fmt(taxasTotal * 5)}</p>
        <p className="text-white/50 text-sm">{totalProcedures} procedimentos realizados</p>
      </div>
    </main>
  );
}

function LegendItem({ color, label, icon }: { color: string; label: string; icon?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color} flex items-center justify-center`}>
        {icon && <span className="text-[8px]">{icon}</span>}
      </div>
      <span className="text-xs text-[#8B6B5A]">{label}</span>
    </div>
  );
}
