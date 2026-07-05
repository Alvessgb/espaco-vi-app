"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export function LoginForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const callbackUrl   = searchParams.get("callbackUrl") ?? "/procedimentos";

  const [email,    setEmail]    = useState("");
  const [sent,     setSent]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Victoria / admin credentials panel
  const [showAdmin,  setShowAdmin]  = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass,  setAdminPass]  = useState("");
  const [adminErr,   setAdminErr]   = useState("");
  const [adminLoad,  setAdminLoad]  = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, callbackUrl, redirect: false });
    setSent(true);
    setLoading(false);
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminErr("");
    setAdminLoad(true);
    const res = await signIn("credentials", {
      email:    adminEmail,
      password: adminPass,
      redirect: false,
    });
    setAdminLoad(false);
    if (res?.error) {
      setAdminErr("Email ou senha incorretos.");
    } else {
      router.push("/victoria");
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main card — customer login */}
      <div className="w-full bg-white rounded-2xl border border-[#E0C5AC] p-6 flex flex-col gap-5 shadow-sm">
        {/* Google */}
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-medium hover:bg-[#4a3a2d] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#ffffff"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff"/>
          </svg>
          Entrar com Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E0C5AC]" />
          <span className="text-xs text-[#8B6B5A]">ou</span>
          <div className="flex-1 h-px bg-[#E0C5AC]" />
        </div>

        {/* Magic link */}
        {sent ? (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-[#5F4B3C]">Link enviado! 🌸</p>
            <p className="text-xs text-[#8B6B5A] mt-1">
              Verifique seu e-mail e clique no link para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-[#E0C5AC] rounded-full px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E0C5AC] text-[#5F4B3C] rounded-full py-3 text-sm font-medium hover:bg-[#d4b49a] transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link por e-mail"}
            </button>
          </form>
        )}
      </div>

      {/* Victoria admin toggle — discrete link at bottom */}
      <div className="text-center">
        <button
          onClick={() => setShowAdmin((v) => !v)}
          className="text-xs text-[#C4A080] hover:text-[#8B6B5A] transition-colors underline underline-offset-2"
        >
          {showAdmin ? "Fechar" : "Área restrita"}
        </button>
      </div>

      {/* Admin login form — slides in */}
      {showAdmin && (
        <div className="w-full bg-white rounded-2xl border border-[#E0C5AC] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🔒</span>
            <p className="text-sm font-semibold text-[#3D2B1F]">Área administrativa</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@estudio.com"
              className="w-full border border-[#E0C5AC] rounded-full px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] transition-colors"
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="Senha"
              className="w-full border border-[#E0C5AC] rounded-full px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] transition-colors"
            />
            {adminErr && (
              <p className="text-xs text-red-500 text-center">{adminErr}</p>
            )}
            <button
              type="submit"
              disabled={adminLoad}
              className="w-full bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-medium hover:bg-[#4a3a2d] transition-colors disabled:opacity-60"
            >
              {adminLoad ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
