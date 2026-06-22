import Link from "next/link";
import { db } from "@/lib/db";
import { Calendar, Clock, MapPin, CircleCheck, CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_FULL = ["Domingo","Segunda-Feira","Terça-Feira","Quarta-Feira","Quinta-Feira","Sexta-Feira","Sábado"];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

interface Props {
  searchParams: Promise<{ appointmentId?: string }>;
}

export default async function AgendamentoConfirmadoPage({ searchParams }: Props) {
  const { appointmentId } = await searchParams;
  if (!appointmentId) redirect("/procedimentos");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      procedures: true,
      payment: true,
      user: { select: { name: true } },
    },
  });

  if (!appointment) redirect("/procedimentos");

  const firstName = appointment.user?.name?.split(" ")[0] ?? "Cliente";
  const d = appointment.startTime;
  const dayName = DAYS_FULL[d.getDay()];
  const dateStr = `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const timeStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const paidNow = appointment.payment?.amountInCents ?? 3000;
  const remaining = Math.max(0, appointment.totalPriceInCents - paidNow);

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      {/* Green hero header */}
      <div className="bg-[#2D6A4F] px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <CircleCheck size={36} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-1">Agendamento confirmado!</h1>
        <p className="text-white/80 text-sm mb-1">Olá, estamos te esperando!</p>
        <p className="text-white/70 text-sm">
          {firstName}, sua reserva está confirmada 🌸
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-10 flex flex-col gap-4">
        {/* Payment confirmed banner */}
        <div className="bg-[#D8F3DC] border border-[#52B788] rounded-2xl px-4 py-3 flex items-start gap-3">
          <CircleCheck size={18} strokeWidth={1.5} className="text-[#2D6A4F] shrink-0 mt-0.5" />
          <p className="text-sm text-[#2D6A4F] leading-relaxed">
            Sua taxa de agendamento foi confirmada e será abatida no valor final do atendimento.
          </p>
        </div>

        {/* Appointment details card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#E0C5AC]/40 px-5 py-3">
            <p className="font-bold text-[#3D2B1F] text-sm">Detalhes do agendamento</p>
          </div>

          <div className="divide-y divide-[#F5EBE0]">
            {/* Date + time */}
            <div className="flex items-start gap-3 px-5 py-4">
              <Calendar size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8B6B5A] mb-0.5">Data e horário</p>
                <p className="text-sm font-bold text-[#3D2B1F] capitalize">
                  {dayName}, {dateStr}
                </p>
                <p className="text-sm font-bold text-[#3D2B1F]">às {timeStr}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3 px-5 py-4">
              <Clock size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8B6B5A] mb-0.5">Duração total</p>
                <p className="text-sm font-bold text-[#3D2B1F]">
                  {formatDuration(appointment.durationMinutes)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 px-5 py-4">
              <MapPin size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8B6B5A] mb-0.5">Local</p>
                <p className="text-sm font-bold text-[#3D2B1F]">Espaço Vi</p>
                <p className="text-xs text-[#8B6B5A]">Endereço confirmado por WhatsApp</p>
              </div>
            </div>

            {/* Procedures */}
            <div className="px-5 py-4">
              <p className="text-xs text-[#8B6B5A] mb-2">Procedimentos agendados</p>
              <div className="flex flex-col gap-1.5">
                {appointment.procedures.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-[#3D2B1F]">{p.name}</span>
                    <span className="font-semibold text-[#3D2B1F]">{formatPrice(p.priceInCents)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment summary */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8B6B5A]">Taxa paga agora</p>
                <p className="text-base font-bold text-[#2D6A4F]">
                  {formatPrice(paidNow)} ✓
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8B6B5A]">Restante no dia</p>
                <p className="text-base font-bold text-[#3D2B1F]">{formatPrice(remaining)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <Link
          href="/meus-agendamentos"
          className="w-full bg-[#2D6A4F] text-white rounded-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#245c43] transition-colors"
        >
          <CalendarDays size={16} strokeWidth={1.5} />
          Ver meus agendamentos
        </Link>

        <Link
          href="/procedimentos"
          className="w-full text-center text-[#5F4B3C] text-sm font-medium py-2 hover:underline transition-colors"
        >
          Voltar ao catálogo →
        </Link>
      </div>
    </main>
  );
}
