"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getCart, clearCart, type CartItem } from "@/lib/cart";
import { createGuestBooking } from "@/lib/guest-booking";
import { createBookingForLoggedUser } from "@/lib/actions";
import {
  ArrowLeft, Calendar, Clock, User, Phone, Mail, Lock,
  Eye, EyeOff, CircleCheck, CheckCircle2,
} from "lucide-react";
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
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}
function formatDate(dateStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return `${DAYS_SHORT[date.getDay()]}, ${d} de ${MONTHS[mo - 1]}`;
}
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2)  return digits.length ? `(${digits}` : "";
  if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}
function toInputDate(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function formatBirthDate(isoDate: string) {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

interface CurrentUser {
  name: string | null;
  email: string;
  phone: string | null;
  birthDate: Date | null;
}

interface Props {
  date: string;
  time: string;
  currentUser: CurrentUser | null;
}

export function CheckoutClient({ date, time, currentUser }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // New-user form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);

  // Existing-user login fields
  const [loginEmail, setLoginEmail]     = useState("");
  const [loginPwd, setLoginPwd]         = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError]     = useState("");

  // Client type toggle (only shown when not logged in)
  const [clientType, setClientType] = useState<"new" | "existing">("new");

  // Submit
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (items.length === 0) { router.replace("/procedimentos"); return null; }

  const totalProcedures = items.reduce((s, i) => s + (i.priceInCents ?? 0), 0);
  const totalDuration   = items.reduce((s, i) => s + (i.durationMinutes ?? 0), 0);
  const procedures = items.map(i => ({
    id: i.id, name: i.name,
    priceInCents: i.priceInCents ?? 0,
    durationMinutes: i.durationMinutes ?? 0,
  }));

  // Logged-in user data
  const loggedName = currentUser?.name ?? "";
  const loggedEmail = currentUser?.email ?? "";
  const loggedPhone = currentUser?.phone ?? "";
  const loggedBirth = toInputDate(currentUser?.birthDate ?? null);

  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await signIn("credentials", { email: loginEmail, password: loginPwd, redirect: false });
      if (res?.error) {
        setLoginError("E-mail ou senha incorretos.");
      } else {
        router.refresh();
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (currentUser) {
        // Logged-in path: use stored data
        const result = await createBookingForLoggedUser({
          date, time,
          phone: loggedPhone,
          birthDate: loggedBirth,
          procedures,
        });
        if (result.error) { setError(result.error); setLoading(false); return; }
        clearCart();
        window.dispatchEvent(new Event("vi:cart-updated"));
        router.push(`/agendamento-confirmado?appointmentId=${result.appointmentId}`);
      } else {
        // New user path
        if (!firstName || !phone || !email || !password) {
          setError("Preencha todos os campos obrigatórios.");
          setLoading(false);
          return;
        }
        const result = await createGuestBooking({
          firstName, lastName, email, password, phone, birthDate, date, time, procedures,
        });
        if (result.error) { setError(result.error); setLoading(false); return; }
        await signIn("credentials", { email, password, redirect: false });
        clearCart();
        window.dispatchEvent(new Event("vi:cart-updated"));
        router.push(`/agendamento-confirmado?appointmentId=${result.appointmentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  // Whether the CTA should be shown
  const showCTA = currentUser !== null || clientType === "new";

  return (
    <div className="min-h-screen bg-[#F5EBE0] pb-32">
      {/* Header */}
      <header className="bg-[#5F4B3C] px-4 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/agendar" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </Link>
          <span className="text-white font-bold text-base">Finalizar agendamento</span>
        </div>
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
                <p className="text-sm font-semibold text-[#3D2B1F]">{formatDate(date)} · {time}</p>
                <p className="text-xs text-[#8B6B5A]">Duração: {formatDuration(totalDuration)}</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#3D2B1F]">{item.name}</span>
                <span className="font-semibold text-[#3D2B1F]">{formatPrice(item.priceInCents)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4 border-t border-[#F5EBE0] pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#8B6B5A]">Valor total</span>
              <span className="font-bold text-[#3D2B1F]">{formatPrice(totalProcedures)}</span>
            </div>
          </div>
        </div>

        {/* ── DADOS DO USUÁRIO ── */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-5 flex flex-col gap-4">
          <h2 className="font-bold text-[#3D2B1F] text-base">Seus dados</h2>

          {currentUser ? (
            /* ── LOGADO: exibe dados em modo leitura ── */
            <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-[#E0C5AC]">
              <ReadRow icon={<User size={14} strokeWidth={1.5} />} label="Nome" value={loggedName || "—"} />
              <ReadRow icon={<Mail size={14} strokeWidth={1.5} />} label="E-mail" value={loggedEmail} />
              <ReadRow icon={<Phone size={14} strokeWidth={1.5} />} label="WhatsApp" value={loggedPhone || "—"} />
              <ReadRow icon={<Calendar size={14} strokeWidth={1.5} />} label="Data de nascimento" value={formatBirthDate(loggedBirth)} last />
            </div>
          ) : (
            /* ── NÃO LOGADO ── */
            <>
              {/* 1. Toggle primeiro */}
              <div>
                <p className="text-xs text-[#8B6B5A] font-medium mb-2.5">Você já tem uma conta?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setClientType("new"); setLoginError(""); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                      clientType === "new"
                        ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                        : "bg-white text-[#8B6B5A] border-[#E0C5AC] hover:border-[#5F4B3C]"
                    }`}
                  >
                    Não sou cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => { setClientType("existing"); setLoginError(""); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                      clientType === "existing"
                        ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                        : "bg-white text-[#8B6B5A] border-[#E0C5AC] hover:border-[#5F4B3C]"
                    }`}
                  >
                    Já sou cliente
                  </button>
                </div>
              </div>

              {clientType === "new" ? (
                /* ── NOVO CLIENTE: formulário de cadastro ── */
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField icon={<User size={15} strokeWidth={1.5} />} label="Nome *">
                      <input
                        required value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                      />
                    </FormField>
                    <FormField icon={<User size={15} strokeWidth={1.5} />} label="Sobrenome">
                      <input
                        value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Sobrenome"
                        className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                      />
                    </FormField>
                  </div>
                  <FormField icon={<Mail size={15} strokeWidth={1.5} />} label="E-mail *">
                    <input
                      required type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com" inputMode="email"
                      className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                    />
                  </FormField>
                  <FormField icon={<Calendar size={15} strokeWidth={1.5} />} label="Data de nascimento">
                    <input
                      type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#3D2B1F] outline-none"
                    />
                  </FormField>
                  <FormField icon={<Phone size={15} strokeWidth={1.5} />} label="WhatsApp *">
                    <input
                      required value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000" inputMode="tel"
                      className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                    />
                  </FormField>
                  <FormField
                    icon={<Lock size={15} strokeWidth={1.5} />} label="Criar senha *"
                    suffix={
                      <button type="button" onClick={() => setShowPass(v => !v)} className="text-[#8B6B5A] shrink-0">
                        {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    }
                  >
                    <input
                      required type={showPass ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Criar senha de acesso"
                      className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                    />
                  </FormField>
                </div>
              ) : (
                /* ── CLIENTE EXISTENTE: login inline ── */
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-[#8B6B5A]">Entre com seu e-mail e senha para preencher seus dados automaticamente.</p>
                  <FormField icon={<Mail size={15} strokeWidth={1.5} />} label="E-mail *">
                    <input
                      type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com" inputMode="email"
                      className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                    />
                  </FormField>
                  <FormField
                    icon={<Lock size={15} strokeWidth={1.5} />} label="Senha *"
                    suffix={
                      <button type="button" onClick={() => setShowLoginPass(v => !v)} className="text-[#8B6B5A] shrink-0">
                        {showLoginPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    }
                  >
                    <input
                      type={showLoginPass ? "text" : "password"} value={loginPwd}
                      onChange={e => setLoginPwd(e.target.value)} placeholder="Sua senha"
                      className="w-full bg-transparent text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none"
                    />
                  </FormField>
                  {loginError && <p className="text-xs text-red-500">{loginError}</p>}
                  <button
                    type="button"
                    onClick={handleInlineLogin}
                    disabled={loginLoading || !loginEmail || !loginPwd}
                    className="w-full bg-[#3D2B1F] text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5F4B3C] transition-colors disabled:opacity-50"
                  >
                    {loginLoading ? (
                      "Entrando..."
                    ) : (
                      <><CheckCircle2 size={15} strokeWidth={1.5} /> Entrar na conta</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}
      </form>

      {/* Sticky CTA */}
      {showCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-[#3D2B1F] px-4 py-4 flex items-center gap-4 max-w-lg mx-auto rounded-t-2xl shadow-2xl">
            <div>
              <p className="text-white/60 text-xs">Valor total</p>
              <p className="text-white font-bold text-xl">{formatPrice(totalProcedures)}</p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 bg-white text-[#3D2B1F] rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#F5EBE0] transition-colors disabled:opacity-60"
            >
              {loading ? "Confirmando..." : <>Confirmar agendamento <span>›</span></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StepDot({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        done || active ? "bg-white text-[#5F4B3C]" : "bg-white/30 text-white"
      }`}>
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

function FormField({ icon, label, children, suffix }: {
  icon: React.ReactNode; label: string;
  children: React.ReactNode; suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-[#8B6B5A] font-medium mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2.5 border border-[#E0C5AC] rounded-xl px-3.5 py-3 focus-within:border-[#5F4B3C] transition-colors bg-[#FDFAF7]">
        <span className="text-[#8B6B5A] shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">{children}</div>
        {suffix}
      </div>
    </div>
  );
}

function ReadRow({ icon, label, value, last }: {
  icon: React.ReactNode; label: string; value: string; last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!last ? "border-b border-[#F5EBE0]" : ""}`}>
      <span className="text-[#8B6B5A] shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#8B6B5A] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-[#3D2B1F] truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}
