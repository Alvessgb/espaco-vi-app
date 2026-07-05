import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { confirmAppointmentPayment } from "@/lib/admin-actions";
import { Calendar, Clock, User, CheckCircle2, Phone } from "lucide-react";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export const dynamic = "force-dynamic";

export default async function PendentesPage() {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/conta");

  const pending = await db.appointment.findMany({
    where: { status: "PENDING_PAYMENT" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      procedures: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <main className="px-4 pt-5 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-bold text-[#3D2B1F] text-lg">Confirmações pendentes</h1>
          <p className="text-xs text-[#8B6B5A] mt-0.5">Confirme após receber o comprovante Pix</p>
        </div>
        <span className="bg-[#FFF3CD] text-[#856404] text-xs font-bold px-3 py-1.5 rounded-full">
          {pending.length} pendente{pending.length !== 1 ? "s" : ""}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0C5AC] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#D8F3DC] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={28} strokeWidth={1.5} className="text-[#2D6A4F]" />
          </div>
          <p className="font-bold text-[#3D2B1F] text-base">Tudo em dia!</p>
          <p className="text-sm text-[#8B6B5A] mt-1">Nenhum agendamento aguardando confirmação.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map(appt => {
            const d = appt.startTime;
            const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

            return (
              <div key={appt.id} className="bg-white rounded-2xl border border-[#E0C5AC] overflow-hidden shadow-sm">
                {/* Pending badge */}
                <div className="bg-[#FFF8E1] px-4 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F9A825] animate-pulse" />
                  <span className="text-xs font-semibold text-[#856404]">Aguardando comprovante Pix</span>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  {/* Client info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E0C5AC] flex items-center justify-center shrink-0">
                      <User size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#3D2B1F] text-sm leading-tight">{appt.user.name}</p>
                      <p className="text-xs text-[#8B6B5A] mt-0.5">{appt.user.email}</p>
                      {appt.user.phone && (
                        <a
                          href={`https://wa.me/55${appt.user.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          className="text-xs text-[#25D366] font-medium flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={11} strokeWidth={1.5} />
                          {appt.user.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Date + procedures */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#8B6B5A]">
                      <Calendar size={13} strokeWidth={1.5} />
                      <span className="font-semibold text-[#3D2B1F]">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8B6B5A]">
                      <Clock size={13} strokeWidth={1.5} />
                      <span>{formatDuration(appt.durationMinutes)}</span>
                    </div>
                    <p className="text-xs text-[#8B6B5A] pl-5">
                      {appt.procedures.map(p => p.name).join(" · ")}
                    </p>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between bg-[#F5EBE0] rounded-xl px-3 py-2.5">
                    <span className="text-xs text-[#8B6B5A]">Taxa a confirmar</span>
                    <span className="font-bold text-[#5F4B3C]">{formatPrice(3000)}</span>
                  </div>

                  {/* Confirm button */}
                  <form
                    action={async () => {
                      "use server";
                      await confirmAppointmentPayment(appt.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full bg-[#2D6A4F] text-white rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#245c43] transition-colors"
                    >
                      <CheckCircle2 size={16} strokeWidth={1.5} />
                      Confirmar pagamento recebido
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
