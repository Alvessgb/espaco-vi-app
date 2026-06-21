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

function formatMonthParam(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default async function AgendaMesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const [appointments, blocks] = await Promise.all([
    db.appointment.findMany({
      where: {
        startTime: { gte: firstDay, lte: lastDay },
        status: { notIn: ["CANCELLED"] },
      },
      select: { id: true, startTime: true },
    }),
    db.scheduleBlock.findMany({
      where: { startTime: { gte: firstDay, lte: lastDay } },
      select: { startTime: true, type: true },
    }),
  ]);

  // Build a map of day -> count
  const apptByDay: Record<number, number> = {};
  for (const a of appointments) {
    const d = a.startTime.getDate();
    apptByDay[d] = (apptByDay[d] ?? 0) + 1;
  }
  const blockedDays = new Set<number>();
  for (const b of blocks) {
    if (b.type === "FULL_DAY") blockedDays.add(b.startTime.getDate());
  }

  // Calendar grid
  const startDow = firstDay.getDay(); // 0=Sun
  const startOffset = startDow === 0 ? 6 : startDow - 1; // Mon=0
  const daysInMonth = lastDay.getDate();
  const today = new Date();

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const monthLabel = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl mb-5">Agenda do Mês</h1>

      {/* Month nav */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-xl border border-[#E0C5AC] px-4 py-3">
        <Link href={`/victoria/agenda/mes?month=${formatMonthParam(prevYear, prevMonth)}`} className="text-[#8B6B5A] hover:text-[#5F4B3C] font-bold">←</Link>
        <span className="flex-1 text-center font-poppins font-medium text-[#3D2B1F] capitalize">{monthLabel}</span>
        <Link href={`/victoria/agenda/mes?month=${formatMonthParam(nextYear, nextMonth)}`} className="text-[#8B6B5A] hover:text-[#5F4B3C] font-bold">→</Link>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div key={d} className="text-center font-poppins text-xs text-[#8B6B5A] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDate = new Date(year, month, dayNum);
          const isPast = dayDate < today && dayDate.toDateString() !== today.toDateString();
          const isBlocked = blockedDays.has(dayNum);
          const count = apptByDay[dayNum] ?? 0;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

          let bgClass = "bg-white border-[#E0C5AC]";
          if (isBlocked) bgClass = "bg-red-50 border-red-200";
          else if (isPast) bgClass = "bg-gray-50 border-gray-100";
          else if (count > 0) bgClass = "bg-[#4CAF50]/10 border-[#4CAF50]/30";

          return (
            <Link
              key={dayNum}
              href={`/victoria/agenda/dia?date=${dateStr}`}
              className={`rounded-lg border p-1.5 text-center min-h-[52px] flex flex-col items-center justify-between hover:border-[#5F4B3C] transition-colors ${bgClass}`}
            >
              <span className={`font-poppins text-xs font-semibold ${isPast ? "text-gray-400" : "text-[#3D2B1F]"}`}>
                {dayNum}
              </span>
              {count > 0 && (
                <span className="font-poppins text-xs text-[#2E7D32]">{count}</span>
              )}
              {isBlocked && (
                <span className="font-poppins text-xs text-red-500">blq</span>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
