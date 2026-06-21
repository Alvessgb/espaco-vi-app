import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { AppointmentCard } from "@/components/ds/appointment-card";
import type { AppointmentStatus } from "@/components/ds/status-badge";
import type { AppointmentStatus as PrismaAppointmentStatus } from "@prisma/client";
import { BottomNav } from "@/components/ds/bottom-nav";

export default async function MeusAgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id!;

  const { tab } = await searchParams;
  const activeTab = tab === "historico" ? "historico" : "proximos";

  const upcomingStatuses: PrismaAppointmentStatus[] = ["PENDING_PAYMENT", "CONFIRMED"];
  const historyStatuses: PrismaAppointmentStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];

  const appointments = await db.appointment.findMany({
    where: {
      userId,
      status: {
        in: activeTab === "proximos"
          ? upcomingStatuses
          : historyStatuses,
      },
    },
    include: {
      procedures: true,
      payment: true,
    },
    orderBy: {
      startTime: activeTab === "proximos" ? "asc" : "desc",
    },
  });

  return (
    <>
    <main className="min-h-screen bg-[#F5EBE0] pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-[#3D2B1F] mb-5 font-poppins">
          Meus agendamentos
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl border border-[#E0C5AC] p-1">
          <Link
            href="/meus-agendamentos?tab=proximos"
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium font-poppins transition-colors ${
              activeTab === "proximos"
                ? "bg-[#5F4B3C] text-white"
                : "text-[#8B6B5A] hover:text-[#5F4B3C]"
            }`}
          >
            Próximos
          </Link>
          <Link
            href="/meus-agendamentos?tab=historico"
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium font-poppins transition-colors ${
              activeTab === "historico"
                ? "bg-[#5F4B3C] text-white"
                : "text-[#8B6B5A] hover:text-[#5F4B3C]"
            }`}
          >
            Histórico
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-base font-semibold text-[#3D2B1F] font-poppins">
              {activeTab === "proximos"
                ? "Nenhum agendamento próximo"
                : "Nenhum agendamento no histórico"}
            </p>
            {activeTab === "proximos" && (
              <Link
                href="/procedimentos"
                className="bg-[#5F4B3C] text-white rounded-full px-6 py-3 text-sm font-medium font-poppins hover:bg-[#4a3a2d] transition-colors"
              >
                Agendar agora
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => {
              const date = appt.startTime.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const time = appt.startTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link key={appt.id} href={`/meus-agendamentos/${appt.id}`}>
                  <AppointmentCard
                    id={appt.id}
                    date={date}
                    time={time}
                    status={appt.status as AppointmentStatus}
                    services={appt.procedures.map((p) => p.name)}
                    durationMinutes={appt.durationMinutes}
                    totalPrice={appt.totalPriceInCents}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
    <BottomNav />
    </>
  );
}
