"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getCart, clearCart, type CartItem } from "@/lib/cart";
import { createGuestBooking } from "@/lib/guest-booking";
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, Lock, Eye, EyeOff, MapPin, CircleCheck } from "lucide-react";
import Link from "next/link";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function formatPrice(cents: number | null) {
  if (cents === null) return "A confirmar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function formatDate(dateStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  const day = DAYS_SHORT[date.getDay()];
  return `${day}, ${d} de ${MONTHS[mo - 1]}`;
}

interface Props {
  date: string;
  time: string;
}

export function CheckoutClient({ date, time }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    router.replace("/procedimentos");
    return null;
  }

  const totalProcedures = items.reduce((s, i) => s + (i.priceInCents ?? 0), 0);
  const totalDuration   = items.reduce((s, i) => s + (i.durationMinutes ?? 0), 0);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2)  return digits.length ? `(${digits}` : "";
    if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !email || !password || !phone) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await createGuestBooking({
        firstName,
        lastName,
        email,
        password,
        phone,
        birthDate,
        date,
        time,
        procedures: items.map((i) => ({
          id: i.id,
          name: i.name,
          priceInCents: i.priceInCents ?? 0,
          durationMinutes: i.durationMinutes ?? 0,
        })),
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Sign in silently so they can see their appointments later
      await signIn("credentials", { email, password, redirect: false });

      clearCart();
      window.dispatchEvent(new Event("vi:cart-updated"));

      router.push(`/agendamento-confirmado?appointmentId=${result.appointmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0] pb-32">
      {/* Header */}
      <header className="bg-[#5F4B3C] px-4 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/agendar"
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </Link>
          <span className="text-white font-bold text-base">Finalizar agendamento</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0">
          <StepDot label="Sacola" done />
          <StepLine />
          <StepDot label="Data e hora" done />
          <StepLine />
          <StepDot label="Confirmação" active />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">
        {/* Booking summary */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5EBE0]">
            <h2 className="font-bold text-[#3D2B1F] text-base mb-3">Resumo do agendamento</h2>
            <div className="flex items-center gap-3 bg-[#F5EBE0] rounded-xl p-3">
              <Calendar size={15} strokeWidth={1.5} className="text-[#5F4B3C] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#3D2B1F]">
                  {formatDate(date)} · {time}
                </p>
                <p className="text-xs text-[#8B6B5A]">Duração: {formatDuration(totalDuration)}</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#3D2B1F]">{item.name}</span>
                <span className="font-semibold text-[#3D2B1F]">{formatPrice(item.priceInCents)}</span>
              </div>
            ))}
          </div>

          <div className="px-5 pb-4 border-t border-[#F5EBE0] pt-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-[#8B6B5A]">
              <span>Total dos procedimentos</span>
              <span className="font-semibold text-[#3D2B1F]">{formatPrice(totalProcedures)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B6B5A]">Taxa de agendamento</span>
              <span className="font-bold text-[#3D2B1F]">R$ 30</span>
            </div>
          </div>
        </div>

        {/* User data form */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-5 flex flex-col gap-4">
          <h2 className="font-bold text-[#3D2B1F] text-base">Seus dados</h2>

          <div className="grid grid-cols-2 gap-3">
            <FormField icon={<User size={15} strokeWidth={1.5} />} label="Nome *">
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
              />
            </FormField>
            <FormField icon={<User size={15} strokeWidth={1.5} />} label="Sobrenome *">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sobrenome"
                className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
              />
            </FormField>
          </div>

          <FormField icon={<Calendar size={15} strokeWidth={1.5} />} label="Data de nascimento *">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-transparent text-sm text-[#3D2B1F] outline-none"
            />
          </FormField>

          <FormField icon={<Phone size={15} strokeWidth={1.5} />} label="WhatsApp *">
            <input
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
            />
          </FormField>

          <FormField icon={<Mail size={15} strokeWidth={1.5} />} label="E-mail *">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              inputMode="email"
              className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
            />
          </FormField>

          <FormField icon={<Lock size={15} strokeWidth={1.5} />} label="Senha *" suffix={
            <button type="button" onClick={() => setShowPass(v => !v)} className="text-[#8B6B5A]">
              {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
            </button>
          }>
            <input
              required
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Criar senha de acesso"
              className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
            />
          </FormField>

          <p className="text-xs text-[#8B6B5A] leading-relaxed -mt-1">
            Já é cliente? Entre com o e-mail cadastrado e sua senha.
          </p>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 bg-white/70 rounded-2xl px-4 py-3">
          <Lock size={14} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5F4B3C] leading-relaxed">
            Seus dados são protegidos e utilizados apenas para o agendamento.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}
      </form>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#3D2B1F] px-4 py-4 flex items-center gap-4 max-w-lg mx-auto rounded-t-2xl shadow-2xl">
          <div>
            <p className="text-white/60 text-xs">Pagar taxa de agendamento</p>
            <p className="text-white font-bold text-xl">R$ 30</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-white text-[#3D2B1F] rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#F5EBE0] transition-colors disabled:opacity-60"
          >
            {loading ? "Confirmando..." : <>Confirmar <span>›</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepDot({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${done ? "bg-white text-[#5F4B3C]" : active ? "bg-white text-[#5F4B3C]" : "bg-white/30 text-white"}`}
      >
        {done ? <CircleCheck size={14} strokeWidth={2} /> : active ? "3" : ""}
      </div>
      <span className={`text-[10px] font-medium ${done || active ? "text-white" : "text-white/50"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine() {
  return <div className="flex-1 h-px bg-white/30 mb-4 mx-1" />;
}

function FormField({
  icon, label, children, suffix,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-[#8B6B5A] font-medium mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2.5 border border-[#E0C5AC] rounded-xl px-3.5 py-3 focus-within:border-[#5F4B3C] transition-colors bg-[#FDFAF7]">
        <span className="text-[#8B6B5A] shrink-0">{icon}</span>
        <div className="flex-1">{children}</div>
        {suffix}
      </div>
    </div>
  );
}
