import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

export default async function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/conta");

  const pendingCount = await db.appointment.count({ where: { status: "PENDING_PAYMENT" } });

  return (
    <div className="min-h-screen bg-[#F5EBE0]">
      <header className="bg-[#5F4B3C] px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/procedimentos" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <div>
            <p className="text-white font-bold text-base leading-tight">Painel</p>
            <p className="text-white/60 text-xs">{config.studioName} · Painel administrativo</p>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { href: "/victoria/pendentes",     label: "Pendentes", badge: pendingCount },
            { href: "/victoria/agenda/dia",    label: "Dia" },
            { href: "/victoria/agenda/semana", label: "Semana" },
            { href: "/victoria/agenda/mes",    label: "Mês" },
            { href: "/victoria/painel",        label: "Painel" },
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-white/30 text-white hover:bg-white hover:text-[#5F4B3C] transition-colors flex items-center gap-1.5"
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${tab.badge > 0 ? "bg-[#F9A825] text-[#3D2B1F]" : "bg-[#2D6A4F] text-white"}`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </header>

      {children}
    </div>
  );
}
