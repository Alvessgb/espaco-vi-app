import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminStatCard } from "@/components/ds/admin-stat-card";
import { Calendar, CircleCheck, TrendingUp, CircleX, Clock, Star } from "lucide-react";
import Link from "next/link";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function PainelPage() {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [upcomingCount, todayCount, completedThisMonth, cancelledThisMonth, paidThisMonth, topProcedures, recentReviews] =
    await Promise.all([
      db.appointment.count({
        where: { status: { in: ["CONFIRMED", "PENDING_PAYMENT"] }, startTime: { gte: now } },
      }),
      db.appointment.count({
        where: { startTime: { gte: todayStart, lte: todayEnd }, status: { notIn: ["CANCELLED"] } },
      }),
      db.appointment.count({
        where: { status: "COMPLETED", startTime: { gte: monthStart } },
      }),
      db.appointment.count({
        where: { status: "CANCELLED", updatedAt: { gte: monthStart } },
      }),
      db.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: monthStart } },
        _sum: { amountInCents: true },
      }),
      db.appointmentProcedure.groupBy({
        by: ["name"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      db.appointmentReview.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

  const revenueThisMonth = paidThisMonth._sum.amountInCents ?? 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl">Resumo da operação</h1>
        <Link
          href="/victoria/procedimentos"
          className="text-sm text-[#5F4B3C] font-poppins border border-[#E0C5AC] rounded-full px-3 py-1.5 hover:bg-[#F5EBE0] transition-colors"
        >
          Ver procedimentos
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <AdminStatCard
          label="Próximos agendamentos"
          value={upcomingCount}
          icon={<Calendar size={16} strokeWidth={1.5} />}
        />
        <AdminStatCard
          label="Atendimentos hoje"
          value={todayCount}
          icon={<Clock size={16} strokeWidth={1.5} />}
        />
        <AdminStatCard
          label="Concluídos no mês"
          value={completedThisMonth}
          icon={<CircleCheck size={16} strokeWidth={1.5} />}
        />
        <AdminStatCard
          label="Receita do mês (taxas)"
          value={formatPrice(revenueThisMonth)}
          icon={<TrendingUp size={16} strokeWidth={1.5} />}
        />
        <AdminStatCard
          label="Cancelamentos no mês"
          value={cancelledThisMonth}
          icon={<CircleX size={16} strokeWidth={1.5} />}
        />
      </div>

      {/* Top procedures */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm mb-4">
        <h2 className="font-poppins font-semibold text-[#3D2B1F] text-base mb-3">Procedimentos mais agendados</h2>
        {topProcedures.length === 0 ? (
          <p className="font-poppins text-sm text-[#8B6B5A]">Nenhum dado disponível.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {topProcedures.map((p, i) => (
              <li key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#F5EBE0] text-[#5F4B3C] font-poppins text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-poppins text-sm text-[#3D2B1F]">{p.name}</span>
                </div>
                <span className="font-poppins text-sm font-medium text-[#5F4B3C]">{p._count.id}x</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <h2 className="font-poppins font-semibold text-[#3D2B1F] text-base mb-3">Avaliações recentes</h2>
        {recentReviews.length === 0 ? (
          <p className="font-poppins text-sm text-[#8B6B5A]">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentReviews.map((r) => (
              <div key={r.id} className="border-b border-[#F5EBE0] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-poppins text-sm font-medium text-[#3D2B1F]">
                    {r.user.name?.split(" ")[0] ?? "Cliente"}
                  </span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} strokeWidth={1.5} className={i < r.rating ? "text-[#5F4B3C] fill-[#5F4B3C]" : "text-[#D4B49A]"} />
                    ))}
                  </span>
                </div>
                {r.comment && (
                  <p className="font-poppins text-xs text-[#8B6B5A] line-clamp-2">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
