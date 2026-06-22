import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

function parseDateParam(d?: string) {
  if (d) { const p = new Date(d + "T00:00:00"); if (!isNaN(p.getTime())) return p; }
  const n = new Date(); n.setHours(0, 0, 0, 0); return n;
}
function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m}min`;
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmado", PENDING_PAYMENT: "Pendente",
  COMPLETED: "Concluído",  CANCELLED: "Cancelado", NO_SHOW: "Não compareceu",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "bg-[#D8F3DC] text-[#2D6A4F]",
  PENDING_PAYMENT: "bg-[#FFF3CD] text-[#856404]",
  COMPLETED: "bg-[#E0C5AC] text-[#5F4B3C]",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-600",
};

// Generate time blocks for the business day
function generateTimeBlocks(start: number, end: number, appointments: { startTime: Date; endTime: Date; durationMinutes: number; user: { name: string | null }; procedures: { name: string }[]; payment: { status: string } | null; status: string }[]) {
  const blocks: { time: string; minutes: number; appt: typeof appointments[0] | null }[] = [];
  let cursor = start * 60; // minutes from midnight
  const endMin = end * 60;

  const sorted = [...appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  while (cursor < endMin) {
    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    const slotStart = h * 60 + m;

    const appt = sorted.find(a => {
      const aStart = a.startTime.getHours() * 60 + a.startTime.getMinutes();
      return aStart === slotStart;
    });

    if (appt) {
      blocks.push({ time: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`, minutes: appt.durationMinutes, appt });
      cursor += appt.durationMinutes;
    } else {
      // Find next appointment gap
      const nextAppt = sorted.find(a => {
        const aStart = a.startTime.getHours() * 60 + a.startTime.getMinutes();
        return aStart > slotStart;
      });
      const gapEnd = nextAppt
        ? nextAppt.startTime.getHours() * 60 + nextAppt.startTime.getMinutes()
        : endMin;
      const gapMin = Math.min(gapEnd - slotStart, endMin - slotStart);
      if (gapMin > 0) {
        blocks.push({ time: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`, minutes: gapMin, appt: null });
      }
      cursor += Math.max(gapMin, 30);
    }
  }
  return blocks;
}

export default async function AgendaDiaPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { date } = await searchParams;
  const day = parseDateParam(date);
  const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(day); dayEnd.setHours(23, 59, 59, 999);

  const appointments = await db.appointment.findMany({
    where: { startTime: { gte: dayStart, lte: dayEnd }, status: { notIn: ["CANCELLED"] } },
    include: { user: { select: { name: true } }, procedures: true, payment: true },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const nextAppt = appointments.find(a => a.status === "CONFIRMED" && a.startTime > now);
  const totalMinutes = appointments.reduce((s, a) => s + a.durationMinutes, 0);
  const taxasHoje = appointments.filter(a => a.payment?.status === "PAID").length * 30;

  const displayDate = day.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const blocks = generateTimeBlocks(9, 19, appointments as Parameters<typeof generateTimeBlocks>[2]);

  return (
    <main className="px-4 pt-5 pb-10 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard value={appointments.length} label="Clientes hoje" icon="👥" />
        <StatCard value={fmtDuration(totalMinutes)} label="Horas ocupadas" icon="⏱" />
        <StatCard value={`R$${taxasHoje}`} label="Taxas recebidas" icon="↗" />
      </div>

      {/* Next client */}
      {nextAppt && (
        <div className="bg-[#3D2B1F] rounded-2xl p-5 mb-4">
          <p className="text-white/60 text-xs mb-1">Próxima cliente</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white font-bold text-lg leading-tight">{nextAppt.user.name}</p>
              <p className="text-white/70 text-sm mt-0.5">{nextAppt.procedures.map(p => p.name).join(" + ")}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-bold text-xl">{nextAppt.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
              <p className="text-white/60 text-xs">{nextAppt.durationMinutes} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Date nav + Bloquear */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-bold text-[#3D2B1F] flex-1 capitalize text-sm">{displayDate}</h2>
        <Link href="/victoria/bloqueios/novo" className="flex items-center gap-1.5 bg-[#F5EBE0] border border-[#E0C5AC] rounded-full px-4 py-2 text-xs font-semibold text-[#5F4B3C]">
          🔒 Bloquear
        </Link>
      </div>

      {/* Prev/Next nav */}
      <div className="flex gap-2 mb-4">
        <Link href={`/victoria/agenda/dia?date=${fmtDate(addDays(day, -1))}`} className="flex-1 text-center bg-white border border-[#E0C5AC] rounded-xl py-2 text-sm text-[#8B6B5A] hover:text-[#5F4B3C]">← Anterior</Link>
        <Link href={`/victoria/agenda/dia?date=${fmtDate(addDays(day, 1))}`}  className="flex-1 text-center bg-white border border-[#E0C5AC] rounded-xl py-2 text-sm text-[#8B6B5A] hover:text-[#5F4B3C]">Próximo →</Link>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-3">
        {blocks.length === 0 && (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#E0C5AC]">
            <p className="text-[#8B6B5A] text-sm">Nenhum atendimento neste dia.</p>
          </div>
        )}
        {blocks.map((block, i) => block.appt ? (
          <div key={i} className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm">
            <div className="flex gap-4">
              <div className="shrink-0 w-14">
                <p className="font-bold text-[#3D2B1F] text-sm">{block.time}</p>
                <p className="text-xs text-[#8B6B5A]">{block.minutes} min</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-[#3D2B1F] text-sm leading-tight">{block.appt.user.name}</p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[block.appt.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[block.appt.status] ?? block.appt.status}
                  </span>
                </div>
                <p className="text-xs text-[#8B6B5A] mb-2">{block.appt.procedures.map(p => p.name).join(" · ")}</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${block.appt.payment?.status === "PAID" ? "bg-[#D8F3DC] text-[#2D6A4F]" : "bg-[#FFF3CD] text-[#856404]"}`}>
                  {block.appt.payment?.status === "PAID" ? "Taxa paga" : "Taxa pendente"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="border border-dashed border-[#E0C5AC] rounded-2xl p-4 flex gap-4">
            <div className="shrink-0 w-14">
              <p className="text-[#C4A080] text-sm font-medium">{block.time}</p>
              <p className="text-xs text-[#C4A080]">{block.minutes} min</p>
            </div>
            <p className="text-[#C4A080] text-sm italic self-center">Horário livre</p>
          </div>
        ))}
      </div>
    </main>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E0C5AC] p-3 shadow-sm">
      <p className="text-lg mb-0.5">{icon}</p>
      <p className="font-bold text-[#3D2B1F] text-xl leading-tight">{value}</p>
      <p className="text-xs text-[#8B6B5A] leading-tight mt-0.5">{label}</p>
    </div>
  );
}
