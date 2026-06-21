import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CircleCheck, Clock, Calendar } from "lucide-react";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
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
  const session = await auth();
  if (!session) redirect("/login");

  const { appointmentId } = await searchParams;
  if (!appointmentId) redirect("/meus-agendamentos");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      procedures: { include: { procedure: true } },
      payment: true,
    },
  });

  if (!appointment || appointment.userId !== session.user?.id) notFound();

  const formattedDate = appointment.startTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = appointment.startTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center gap-6">
        {/* Success icon */}
        <div className="flex flex-col items-center gap-2 text-center">
          <CircleCheck size={56} strokeWidth={1.5} className="text-[#4CAF50]" />
          <h1 className="text-2xl font-bold text-[#3D2B1F]">
            Agendamento confirmado 🌸
          </h1>
          <p className="text-sm text-[#8B6B5A]">
            Olá, estamos te esperando!
          </p>
        </div>

        {/* Summary card */}
        <div className="w-full bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm flex flex-col gap-4">
          {/* Date & time */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-[#5F4B3C]">
              <Calendar size={15} strokeWidth={1.5} className="shrink-0" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#5F4B3C]">
              <Clock size={15} strokeWidth={1.5} className="shrink-0" />
              <span>
                {formattedTime} · {formatDuration(appointment.durationMinutes)}
              </span>
            </div>
          </div>

          <div className="border-t border-[#F5EBE0]" />

          {/* Services */}
          <div>
            <p className="text-xs font-semibold text-[#8B6B5A] mb-2 uppercase tracking-wide">
              Procedimentos
            </p>
            <ul className="flex flex-col gap-1.5">
              {appointment.procedures.map((ap) => (
                <li key={ap.id} className="flex justify-between text-sm">
                  <span className="text-[#3D2B1F]">{ap.name}</span>
                  <span className="text-[#8B6B5A]">
                    {formatPrice(ap.priceInCents)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#F5EBE0]" />

          {/* Payment */}
          <div className="flex justify-between text-sm">
            <span className="text-[#8B6B5A]">Taxa paga</span>
            <span className="font-semibold text-[#4CAF50]">
              {formatPrice(appointment.payment?.amountInCents ?? 3000)}
            </span>
          </div>
        </div>

        <Link
          href="/meus-agendamentos"
          className="w-full text-center bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-medium hover:bg-[#4a3a2d] transition-colors"
        >
          Ver meus agendamentos
        </Link>
      </div>
    </main>
  );
}
