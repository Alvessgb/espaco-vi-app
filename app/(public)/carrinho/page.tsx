import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartPageClient } from "./cart-page-client";

export default function CarrinhoPage() {
  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link
          href="/procedimentos"
          className="inline-flex items-center gap-1 text-sm text-[#8B6B5A] hover:text-[#5F4B3C] transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Continuar escolhendo
        </Link>
        <h1 className="text-xl font-semibold text-[#3D2B1F] mb-5">
          Meu carrinho
        </h1>
        <CartPageClient />
      </div>
    </main>
  );
}
