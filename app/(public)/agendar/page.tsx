import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SchedulingClient } from "./scheduling-client";

export default function AgendarPage() {
  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link
          href="/carrinho"
          className="inline-flex items-center gap-1 text-sm text-[#8B6B5A] hover:text-[#5F4B3C] transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Voltar ao carrinho
        </Link>

        <div className="mb-5">
          <h1 className="text-xl font-semibold text-[#3D2B1F]">
            Escolha data e horário
          </h1>
          <p className="text-sm text-[#8B6B5A] mt-0.5">
            Atendimentos de segunda a sábado, das 9h às 19h.
          </p>
        </div>

        <SchedulingClient />
      </div>
    </main>
  );
}
