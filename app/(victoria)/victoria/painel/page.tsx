import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { CircleCheck, CalendarDays, CircleX, Clock, TrendingUp, Star, Lock, LayoutList } from "lucide-react";

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(cents / 100);
}
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default async function PainelPage() {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthName = MONTHS[now.getMonth()];

  const [completedCount, futureCount, cancelledCount, paidMonth, topProcedures, recentReviews] = await Promise.all([
    db.appointment.count({ where: { status: "COMPLETED", startTime: { gte: monthStart } } }),
    db.appointment.count({ where: { status: { in: ["CONFIRMED","PENDING_PAYMENT"] }, startTime: { gte: now } } }),
    db.appointment.count({ where: { status: "CANCELLED", updatedAt: { gte: monthStart } } }),
    db.payment.aggregate({ where: { status: "PAID", paidAt: { gte: monthStart } }, _sum: { amountInCents: true } }),
    db.appointmentProcedure.groupBy({ by: ["name"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
    db.appointmentReview.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, appointment: { select: { procedures: { select: { name: true } } } } } }),
  ]);

  const taxasTotal = paidMonth._sum.amountInCents ?? 0;
  const maxCount = topProcedures[0]?._count.id ?? 1;

  return (
    <main className="px-4 pt-5 pb-10 max-w-lg mx-auto flex flex-col gap-4">
      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<CircleCheck size={18} strokeWidth={1.5} className="text-[#2D6A4F]" />} value={completedCount} label="Concluídos este mês" />
        <StatCard icon={<CalendarDays size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />} value={futureCount} label="Agendamentos futuros" />
        <StatCard icon={<CircleX size={18} strokeWidth={1.5} className="text-red-500" />} value={cancelledCount} label="Cancelamentos" />
        <StatCard icon={<Clock size={18} strokeWidth={1.5} className="text-[#856404]" />} value={0} label="Reagendamentos" />
      </div>

      {/* Revenue card */}
      <div className="bg-[#3D2B1F] rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs flex items-center gap-1">
              <TrendingUp size={12} strokeWidth={1.5} /> Receita total — {monthName}
            </p>
            <p className="text-white font-bold text-3xl mt-1">
              {fmt(taxasTotal * 5)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Taxas recebidas</p>
            <p className="text-white font-bold text-lg">{fmt(taxasTotal)}</p>
            <p className="text-white/40 text-xs mt-0.5">{Math.round(taxasTotal / 3000)} × R$30</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <Link href="/victoria/bloqueios/novo" className="flex items-center gap-3 bg-white rounded-2xl border border-[#E0C5AC] px-5 py-4 shadow-sm hover:bg-[#F5EBE0] transition-colors">
        <Lock size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
        <span className="text-sm font-medium text-[#3D2B1F]">Bloquear horário ou dia</span>
      </Link>

      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <LayoutList size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
          <div>
            <p className="font-semibold text-[#3D2B1F] text-sm">Procedimentos</p>
            <p className="text-xs text-[#8B6B5A]">Adicionar, editar ou remover serviços do catálogo.</p>
          </div>
        </div>
        <Link href="/victoria/procedimentos" className="block w-full text-center bg-[#3D2B1F] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[#5F4B3C] transition-colors">
          Ver procedimentos
        </Link>
      </div>

      {/* Top procedures with bar */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <h2 className="font-bold text-[#3D2B1F] text-sm mb-4 flex items-center gap-2">
          <TrendingUp size={16} strokeWidth={1.5} className="text-[#5F4B3C]" /> Serviços mais agendados
        </h2>
        {topProcedures.length === 0 ? (
          <p className="text-sm text-[#8B6B5A]">Nenhum dado ainda.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {topProcedures.map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[#3D2B1F]">{p.name}</span>
                  <span className="font-bold text-[#3D2B1F]">{p._count.id}x</span>
                </div>
                <div className="h-1.5 bg-[#F5EBE0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#5F4B3C] rounded-full transition-all" style={{ width: `${Math.round((p._count.id / maxCount) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <h2 className="font-bold text-[#3D2B1F] text-sm mb-4">💬 Avaliações recentes</h2>
        {recentReviews.length === 0 ? (
          <p className="text-sm text-[#8B6B5A]">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentReviews.map(r => {
              const procName = r.appointment?.procedures[0]?.name ?? "—";
              const displayName = r.user.name?.split(" ").slice(0,2).map((n,i,a) => i===a.length-1 ? n[0]+"." : n).join(" ") ?? "Cliente";
              return (
                <div key={r.id} className="border-b border-[#F5EBE0] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-semibold text-[#3D2B1F] text-sm">{displayName}</p>
                      <p className="text-xs text-[#8B6B5A]">{procName}</p>
                    </div>
                    <span className="flex gap-0.5">
                      {Array.from({length:5}).map((_,i) => (
                        <Star key={i} size={11} strokeWidth={1.5} className={i < r.rating ? "text-[#5F4B3C] fill-[#5F4B3C]" : "text-[#D4B49A]"} />
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="text-xs text-[#5F4B3C] italic">"{r.comment}"</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm">
      <div className="mb-2">{icon}</div>
      <p className="font-bold text-[#3D2B1F] text-2xl leading-tight">{value}</p>
      <p className="text-xs text-[#8B6B5A] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
