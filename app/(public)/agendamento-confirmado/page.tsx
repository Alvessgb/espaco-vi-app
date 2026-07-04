import Link from "next/link";
import { db } from "@/lib/db";
import { Calendar, Clock, MapPin } from "lucide-react";
import { redirect } from "next/navigation";
import { CopyButton } from "./copy-button";

export const dynamic = "force-dynamic";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_FULL = ["Domingo","Segunda-Feira","Terça-Feira","Quarta-Feira","Quinta-Feira","Sexta-Feira","Sábado"];

const PIX_KEY = "65.025.945/0001-03";
const PIX_NAME = "Victoria Aragão Soares — PicPay";
const TAXA_CENTS = 3000;
const VICTORIA_WHATSAPP = "5585992446390";

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
    include: { procedures: true, user: { select: { name: true } } },
  });

  if (!appointment) redirect("/procedimentos");

  const firstName = appointment.user?.name?.split(" ")[0] ?? "Cliente";
  const d = appointment.startTime;
  const dayName = DAYS_FULL[d.getDay()];
  const dateStr = `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const timeStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const remaining = Math.max(0, appointment.totalPriceInCents - TAXA_CENTS);

  const whatsappMsg = encodeURIComponent(
    `Olá Victoria! Acabei de agendar um procedimento no Espaço Vi e enviei o comprovante do Pix de R$30. Meu agendamento é dia ${d.getDate()} de ${MONTHS[d.getMonth()]} às ${timeStr}. Nome: ${appointment.user?.name ?? firstName}.`
  );
  const whatsappUrl = `https://wa.me/${VICTORIA_WHATSAPP}?text=${whatsappMsg}`;

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      {/* Amber pending header */}
      <div className="bg-[#5F4B3C] px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="text-white text-xl font-bold mb-1">Quase lá, {firstName}!</h1>
        <p className="text-white/80 text-sm leading-relaxed">
          Seu horário está reservado. Falta apenas pagar a taxa de agendamento para confirmar. 🌸
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-10 flex flex-col gap-4">

        {/* Status banner */}
        <div className="bg-[#FFF8E1] border border-[#F9A825]/40 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold text-[#856404]">Aguardando pagamento da taxa</p>
            <p className="text-xs text-[#856404]/80 mt-0.5 leading-relaxed">
              Seu agendamento só será confirmado após o pagamento de R$30 via Pix e envio do comprovante no WhatsApp.
            </p>
          </div>
        </div>

        {/* Appointment details card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#E0C5AC]/40 px-5 py-3">
            <p className="font-bold text-[#3D2B1F] text-sm">Detalhes do agendamento</p>
          </div>
          <div className="divide-y divide-[#F5EBE0]">
            <div className="flex items-start gap-3 px-5 py-4">
              <Calendar size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8B6B5A] mb-0.5">Data e horário</p>
                <p className="text-sm font-bold text-[#3D2B1F] capitalize">{dayName}, {dateStr}</p>
                <p className="text-sm font-bold text-[#3D2B1F]">às {timeStr}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-5 py-4">
              <Clock size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8B6B5A] mb-0.5">Duração total</p>
                <p className="text-sm font-bold text-[#3D2B1F]">{formatDuration(appointment.durationMinutes)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-5 py-4">
              <MapPin size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8B6B5A] mb-0.5">Local</p>
                <p className="text-sm font-bold text-[#3D2B1F]">Espaço Vi</p>
                <p className="text-xs text-[#8B6B5A]">Endereço confirmado por WhatsApp</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-[#8B6B5A] mb-2">Procedimentos</p>
              <div className="flex flex-col gap-1.5">
                {appointment.procedures.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-[#3D2B1F]">{p.name}</span>
                    <span className="font-semibold text-[#3D2B1F]">{formatPrice(p.priceInCents)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8B6B5A]">Taxa de agendamento</p>
                <p className="text-base font-bold text-[#5F4B3C]">{formatPrice(TAXA_CENTS)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8B6B5A]">Restante no dia</p>
                <p className="text-base font-bold text-[#3D2B1F]">{formatPrice(remaining)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pix payment card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#5F4B3C] px-5 py-3">
            <p className="font-bold text-white text-sm">Pagamento via Pix</p>
          </div>
          <div className="px-5 py-5 flex flex-col gap-4">
            <div className="text-center">
              <p className="text-xs text-[#8B6B5A] mb-1">Valor a pagar</p>
              <p className="text-3xl font-bold text-[#3D2B1F]">R$ 30,00</p>
              <p className="text-xs text-[#8B6B5A] mt-1">Será abatido do valor total no dia do atendimento</p>
            </div>

            <div className="bg-[#F5EBE0] rounded-xl p-4 flex flex-col gap-3">
              <div>
                <p className="text-xs text-[#8B6B5A] mb-1.5 font-medium uppercase tracking-wide">Chave Pix (e-mail)</p>
                <PixKeyRow pixKey={PIX_KEY} />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8B6B5A]">
                <span className="font-medium text-[#5F4B3C]">Nome:</span> {PIX_NAME}
              </div>
            </div>

            <p className="text-xs text-center text-[#8B6B5A] leading-relaxed">
              Após o pagamento, envie o comprovante para confirmarmos seu agendamento ✨
            </p>

            <div className="flex flex-col gap-2 text-sm text-[#5F4B3C]">
              <div className="flex items-start gap-2">
                <span className="shrink-0 font-bold">1.</span>
                <span>Abra o app do seu banco e acesse a área Pix</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 font-bold">2.</span>
                <span>Copie a chave e envie <strong>R$ 30,00</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 font-bold">3.</span>
                <span>Envie o comprovante no WhatsApp clicando abaixo</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-white rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-3 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
          Enviar comprovante no WhatsApp
        </a>

        <Link
          href="/meus-agendamentos"
          className="w-full text-center border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-3.5 text-sm font-semibold"
        >
          Ver meus agendamentos
        </Link>

        <Link
          href="/procedimentos"
          className="w-full text-center text-[#8B6B5A] text-sm py-2"
        >
          Voltar ao catálogo →
        </Link>
      </div>
    </main>
  );
}

function PixKeyRow({ pixKey }: { pixKey: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-mono text-base font-bold text-[#3D2B1F] break-all leading-snug">{pixKey}</p>
        <p className="text-xs text-[#8B6B5A] mt-1">E-mail</p>
      </div>
      <CopyButton text={pixKey} />
    </div>
  );
}
