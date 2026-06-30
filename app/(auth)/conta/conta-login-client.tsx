"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createUserAccount } from "@/lib/actions";

export function ContaLoginClient({ defaultTab = "login" }: { defaultTab?: "login" | "criar" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "criar">(defaultTab);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Criar conta state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [criarEmail, setCriarEmail] = useState("");
  const [criarPass, setCriarPass] = useState("");
  const [showCriarPass, setShowCriarPass] = useState(false);
  const [criarErr, setCriarErr] = useState("");
  const [criarLoading, setCriarLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    setLoginLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoginLoading(false);
    if (res?.error) {
      setLoginErr("E-mail ou senha incorretos.");
    } else {
      router.push("/conta");
      router.refresh();
    }
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setCriarErr("");
    if (criarPass.length < 6) { setCriarErr("Senha deve ter pelo menos 6 caracteres."); return; }
    setCriarLoading(true);
    try {
      await createUserAccount({
        firstName, lastName, birthDate, phone,
        email: criarEmail, password: criarPass,
      });
      const res = await signIn("credentials", { email: criarEmail, password: criarPass, redirect: false });
      if (res?.error) {
        setCriarErr("Conta criada, mas erro ao entrar. Tente fazer login.");
        setTab("login");
        setCriarLoading(false);
        return;
      }
      router.push("/conta");
      router.refresh();
    } catch (err) {
      setCriarErr(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setCriarLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0]">
      {/* Brown header */}
      <header className="bg-[#5F4B3C] px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <a href="/procedimentos" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </a>
          <h1 className="text-white font-bold text-lg">Minha conta</h1>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[#E0C5AC] flex items-center justify-center">
            <span className="text-[#5F4B3C] font-bold text-2xl">?</span>
          </div>
          <p className="text-white/80 text-sm">Entre ou crie sua conta</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-24 flex flex-col gap-4">
        {/* Tab switcher */}
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${tab === "login" ? "bg-[#5F4B3C] text-white" : "text-[#8B6B5A]"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTab("criar")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${tab === "criar" ? "bg-[#5F4B3C] text-white" : "text-[#8B6B5A]"}`}
          >
            Criar conta
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs text-[#8B6B5A] mb-1">E-mail</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-[#E0C5AC] rounded-xl px-4 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B6B5A] mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••"
                  className="w-full border border-[#E0C5AC] rounded-xl px-4 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C] pr-10"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6B5A]">
                  {showPass ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            {loginErr && <p className="text-xs text-red-500 text-center">{loginErr}</p>}
            <button type="submit" disabled={loginLoading} className="bg-[#5F4B3C] text-white rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCriar} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8B6B5A] mb-1">Nome *</label>
                <input required value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Ex: Maria" className="w-full border border-[#E0C5AC] rounded-xl px-3 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]" />
              </div>
              <div>
                <label className="block text-xs text-[#8B6B5A] mb-1">Sobrenome *</label>
                <input required value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder="Ex: Silva" className="w-full border border-[#E0C5AC] rounded-xl px-3 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8B6B5A] mb-1">Data de nascimento *</label>
              <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)}
                className="w-full border border-[#E0C5AC] rounded-xl px-3 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]" />
            </div>
            <div>
              <label className="block text-xs text-[#8B6B5A] mb-1">WhatsApp</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-9999" className="w-full border border-[#E0C5AC] rounded-xl px-3 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]" />
            </div>
            <div>
              <label className="block text-xs text-[#8B6B5A] mb-1">E-mail *</label>
              <input type="email" required value={criarEmail} onChange={e => setCriarEmail(e.target.value)}
                placeholder="seu@email.com" className="w-full border border-[#E0C5AC] rounded-xl px-3 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]" />
            </div>
            <div>
              <label className="block text-xs text-[#8B6B5A] mb-1">Senha *</label>
              <div className="relative">
                <input type={showCriarPass ? "text" : "password"} required value={criarPass}
                  onChange={e => setCriarPass(e.target.value)} placeholder="Mínimo 6 caracteres"
                  className="w-full border border-[#E0C5AC] rounded-xl px-3 py-3 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C] pr-10" />
                <button type="button" onClick={() => setShowCriarPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6B5A]">
                  {showCriarPass ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            {criarErr && <p className="text-xs text-red-500 text-center">{criarErr}</p>}
            <button type="submit" disabled={criarLoading} className="bg-[#5F4B3C] text-white rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
              {criarLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        )}

        <p className="text-xs text-[#8B6B5A] text-center px-4">
          Você também pode agendar sem fazer login — pediremos seus dados apenas na confirmação.
        </p>
      </div>
    </div>
  );
}
