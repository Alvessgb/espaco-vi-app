import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge, type AppointmentStatus } from "@/components/ds/status-badge";
import { CancelAppointmentButton } from "./cancel-button";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const appt = await db.appointment.findFirst({
    where: { id, userId: session.user.id },
    include: { procedures: true, payment: true },
  });

  if (!appt) notFound();

  const date = appt.startTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = appt.startTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <a href="/meus-agendamentos" className="text-sm text-[#8B6B5A] font-poppins mb-4 inline-block hover:text-[#5F4B3C]">
          ← Meus agendamentos
        </a>
        <h1 className="text-xl font-semibold text-[#3D2B1F] mb-5 font-poppins">Detalhe do agendamento</h1>

        <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm flex flex-col gap-5">
          {/* Date/time + status */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-poppins font-medium text-[#3D2B1F] capitalize">{date}</p>
              <p className="font-poppins text-sm text-[#8B6B5A]">{time}</p>
            </div>
            <StatusBadge status={appt.status as AppointmentStatus} />
          </div>

          {/* Services */}
          <div>
            <h2 className="font-poppins font-semibold text-[#5F4B3C] text-sm mb-2">Serviços</h2>
            <div className="flex flex-col gap-2">
              {appt.procedures.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-poppins text-sm text-[#3D2B1F]">{p.name}</p>
                    <p className="font-poppins text-xs text-[#8B6B5A]">{p.durationMinutes}min</p>
                  </div>
                  <span className="font-poppins text-sm font-medium text-[#5F4B3C]">
                    {formatPrice(p.priceInCents)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[#F5EBE0] pt-3 flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="font-poppins text-sm text-[#8B6B5A]">Duração total</span>
              <span className="font-poppins text-sm text-[#3D2B1F]">{appt.durationMinutes}min</span>
            </div>
            <div className="flex justify-between">
              <span className="font-poppins text-sm font-semibold text-[#3D2B1F]">Total</span>
              <span className="font-poppins text-sm font-semibold text-[#5F4B3C]">{formatPrice(appt.totalPriceInCents)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#F5EBE0] rounded-xl p-3">
            <h2 className="font-poppins font-semibold text-[#5F4B3C] text-sm mb-1">Taxa de agendamento</h2>
            <div className="flex justify-between items-center">
              <span className="font-poppins text-sm text-[#8B6B5A]">R$ 30,00</span>
              {appt.payment?.status === "PAID" ? (
                <span className="text-xs font-poppins text-[#2E7D32] bg-[#4CAF50]/15 px-2 py-0.5 rounded-full">Paga</span>
              ) : (
                <span className="text-xs font-poppins text-[#E65100] bg-[#F9A825]/20 px-2 py-0.5 rounded-full">Pendente</span>
              )}
            </div>
            <p className="font-poppins text-xs text-[#8B6B5A] mt-1">
              A taxa será abatida no valor total no dia do atendimento.
            </p>
          </div>

          {/* Cancel button */}
          {appt.status === "CONFIRMED" && (
            <CancelAppointmentButton appointmentId={appt.id} />
          )}
        </div>
      </div>
    </main>
  );
}
