import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F5EBE0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-[#5F4B3C] flex items-center justify-center text-white text-2xl font-bold select-none">
            Vi
          </div>
          <h1 className="text-xl font-semibold text-[#3D2B1F]">Espaço Vi</h1>
          <p className="text-sm text-[#8B6B5A] text-center">
            Entre para confirmar seu agendamento
          </p>
        </div>

        <Suspense fallback={<div className="w-full h-48 bg-white rounded-2xl animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-xs text-[#8B6B5A] text-center">
          Ao entrar, você concorda com nossos termos de uso.
        </p>
      </div>
    </main>
  );
}
