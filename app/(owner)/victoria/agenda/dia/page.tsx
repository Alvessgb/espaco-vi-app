import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { fmtDuration } from "@/lib/format";
import { AgendaAppointmentCard } from "../agenda-card";
import { UnblockButton } from "../unblock-button";
import type { AgendaAppt } from "../agenda-card";

function parseDateParam(d?: string) {
  if (d) { const p = new Date(d + "T00:00:00"); if (!isNaN(p.getTime())) return p; }
  const n = new Date(); n.setHours(0, 0, 0, 0); return n;
}
function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmado", PENDING_PAYMENT: "Pendente",
  COMPLETED: "Realizado",  CANCELLED: "Cancelado",
  NO_SHOW: "Não realizado", RESCHEDULED: "Reagendado",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED:       "bg-[#D8F3DC] text-[#2D6A4F]",
  PENDING_PAYMENT: "bg-[#FFF3CD] text-[#856404]",
  COMPLETED:       "bg-blue-50 text-blue-700",
  CANCELLED:       "bg-red-100 text-red-700",
  NO_SHOW:         "bg-gray-100 text-gray-600",
  RESCHEDULED:     "bg-blue-50 text-blue-700",
};

// Serialised appointment — safe to pass to Client Components (no Date objects)
interface SerializedAppt extends AgendaAppt {
  startMinutes: number;
  timeLabel: string;
}

interface SerializedBlock {
  id: string;
  startMinutes: number;
  durationMinutes: number;
  reason: string;
  note?: string | null;
}

type Block =
  | { kind: "appt";  time: string; appt: AgendaAppt }
  | { kind: "block"; time: string; minutes: number; id: string; reason: string; note?: string | null }
  | { kind: "free";  time: string; minutes: number };

type TimelineItem = { startMinutes: number; durationMinutes: number; kind: "appt" | "block" };

function buildTimeline(
  startMinutes: number,
  endMinutes: number,
  appts: SerializedAppt[],
  scheduleBlocks: SerializedBlock[],
): Block[] {
  const blocks: Block[] = [];
  let cursor = startMinutes;
  const endMin = endMinutes;

  const items: TimelineItem[] = [
    ...appts.map(a => ({ startMinutes: a.startMinutes, durationMinutes: a.durationMinutes, kind: "appt" as const })),
    ...scheduleBlocks.map(b => ({ startMinutes: b.startMinutes, durationMinutes: b.durationMinutes, kind: "block" as const })),
  ].sort((a, b) => a.startMinutes - b.startMinutes);

  while (cursor < endMin) {
    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    const matchItem = items.find(it => it.startMinutes === cursor);
    if (matchItem?.kind === "appt") {
      const appt = appts.find(a => a.startMinutes === cursor)!;
      const { startMinutes: _, timeLabel: __, ...clientAppt } = appt;
      void _; void __;
      blocks.push({ kind: "appt", time: timeStr, appt: clientAppt as AgendaAppt });
      cursor += appt.durationMinutes;
    } else if (matchItem?.kind === "block") {
      const blk = scheduleBlocks.find(b => b.startMinutes === cursor)!;
      blocks.push({ kind: "block", time: timeStr, minutes: blk.durationMinutes, id: blk.id, reason: blk.reason, note: blk.note });
      cursor += blk.durationMinutes;
    } else {
      const nextItem = items.find(it => it.startMinutes > cursor);
      const gapEnd = nextItem ? nextItem.startMinutes : endMin;
      const gapMin = Math.min(gapEnd - cursor, endMin - cursor);
      if (gapMin > 0) blocks.push({ kind: "free", time: timeStr, minutes: gapMin });
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

  const [raw, rawBlocks] = await Promise.all([
    db.appointment.findMany({
      where: { startTime: { gte: dayStart, lte: dayEnd }, status: { notIn: ["CANCELLED"] } },
      include: { user: { select: { name: true } }, procedures: true, payment: true },
      orderBy: { startTime: "asc" },
    }),
    db.scheduleBlock.findMany({
      where: { startTime: { gte: dayStart, lte: dayEnd } },
      orderBy: { startTime: "asc" },
    }),
  ]);

  // Serialise: extract only primitives + plain objects (no Date, no Prisma internals)
  const appts: SerializedAppt[] = raw.map(a => ({
    id:               a.id,
    status:           a.status as string,
    durationMinutes:  a.durationMinutes,
    totalPriceInCents: a.totalPriceInCents,
    user:             { name: a.user.name },
    procedures:       a.procedures.map(p => ({ name: p.name })),
    payment:          a.payment ? { status: a.payment.status as string } : null,
    startMinutes:     a.startTime.getHours() * 60 + a.startTime.getMinutes(),
    timeLabel:        a.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    // server-only — used below, not passed to any Client Component
    _startTime:       a.startTime,
  } as SerializedAppt & { _startTime: Date }));

  const BLOCK_REASON_LABEL: Record<string, string> = {
    DAY_OFF: "Folga", COURSE: "Curso / Capacitação",
    MAINTENANCE: "Manutenção", VACATION: "Férias", OTHER: "Bloqueio",
  };

  const scheduleBlocks: SerializedBlock[] = rawBlocks.map(b => ({
    id: b.id,
    startMinutes: b.startTime.getHours() * 60 + b.startTime.getMinutes(),
    durationMinutes: Math.round((b.endTime.getTime() - b.startTime.getTime()) / 60000),
    reason: BLOCK_REASON_LABEL[b.reason] ?? b.reason,
    note: b.note,
  }));

  const now = new Date();
  const nextAppt = (appts as (SerializedAppt & { _startTime?: Date })[]).find(
    a => a.status === "CONFIRMED" && a._startTime && a._startTime > now
  );
  const totalMinutes = appts.reduce((s, a) => s + a.durationMinutes, 0);
  const taxasHoje = appts.filter(a => a.payment?.status === "PAID").length * 30;

  const displayDate = day.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const blocks = buildTimeline(9 * 60, 18 * 60 + 30, appts, scheduleBlocks);

  return (
    <main className="px-4 pt-5 pb-10 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard value={appts.length} label="Clientes hoje" icon="👥" />
        <StatCard value={fmtDuration(totalMinutes)} label="Horas ocupadas" icon="⏱" />
        <StatCard value={`R$${taxasHoje}`} label="Taxas recebidas" icon="↗" />
      </div>

      {/* Próxima cliente */}
      {nextAppt && (
        <div className="bg-[#3D2B1F] rounded-2xl p-5 mb-4">
          <p className="text-white/60 text-xs mb-1">Próxima cliente</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white font-bold text-lg leading-tight">{nextAppt.user.name}</p>
              <p className="text-white/70 text-sm mt-0.5">{nextAppt.procedures.map(p => p.name).join(" + ")}</p>
              <span className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[nextAppt.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABEL[nextAppt.status] ?? nextAppt.status}
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-bold text-xl">{nextAppt.timeLabel}</p>
              <p className="text-white/60 text-xs mt-0.5">{fmtDuration(nextAppt.durationMinutes)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date header + Bloquear */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-bold text-[#3D2B1F] flex-1 capitalize text-sm">{displayDate}</h2>
        <Link href="/victoria/bloqueios/novo" className="flex items-center gap-1.5 bg-[#F5EBE0] border border-[#E0C5AC] rounded-full px-4 py-2 text-xs font-semibold text-[#5F4B3C]">
          🔒 Bloquear
        </Link>
      </div>

      {/* Prev/Next */}
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
        {blocks.map((block, i) =>
          block.kind === "appt" ? (
            <AgendaAppointmentCard key={i} time={block.time} appt={block.appt} />
          ) : block.kind === "block" ? (
            <div key={i} className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="shrink-0 w-12">
                  <p className="text-red-400 text-sm font-medium">{block.time}</p>
                  <p className="text-[11px] text-red-400 mt-0.5">{fmtDuration(block.minutes)}</p>
                </div>
                <div className="self-center">
                  <p className="text-red-600 text-sm font-semibold">🔒 {block.reason}</p>
                  {block.note && <p className="text-red-400 text-xs mt-0.5">{block.note}</p>}
                </div>
              </div>
              <UnblockButton id={block.id} />
            </div>
          ) : (
            <div key={i} className="border border-dashed border-[#E0C5AC] rounded-2xl p-4 flex gap-3">
              <div className="shrink-0 w-12">
                <p className="text-[#C4A080] text-sm font-medium">{block.time}</p>
                <p className="text-[11px] text-[#C4A080] mt-0.5">{fmtDuration(block.minutes)}</p>
              </div>
              <p className="text-[#C4A080] text-sm italic self-center">Horário livre</p>
            </div>
          )
        )}
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
