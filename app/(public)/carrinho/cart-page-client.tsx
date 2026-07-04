"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, removeFromCart, clearCart, type CartItem } from "@/lib/cart";
import { Clock, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function formatPrice(cents: number | null) {
  if (cents === null) return "A confirmar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return "A confirmar";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function CartPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  function handleRemove(id: string) {
    removeFromCart(id);
    setItems(getCart());
    window.dispatchEvent(new Event("vi:cart-updated"));
  }

  if (!mounted) return null;

  const totalProcedures = items.reduce((sum, i) => sum + (i.priceInCents ?? 0), 0);
  const totalDurationMinutes = items.reduce((sum, i) => sum + (i.durationMinutes ?? 0), 0);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5EBE0]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#5F4B3C] px-4 py-3 flex items-center gap-3">
          <Link href="/procedimentos" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </Link>
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-base">Minha sacola</p>
          </div>
          <div className="w-9" />
        </header>
        <div className="flex flex-col items-center gap-5 py-16 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-[#EDD9C5] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B6B5A" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-[#3D2B1F]">Sua sacola está vazia</p>
            <p className="text-sm text-[#8B6B5A] mt-1">Adicione procedimentos para continuar</p>
          </div>
          <Link href="/procedimentos" className="bg-[#5F4B3C] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-[#4a3a2d] transition-colors">
            Escolher procedimentos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EBE0] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#5F4B3C] px-4 py-3 flex items-center">
        <Link href="/procedimentos" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
          <ArrowLeft size={16} strokeWidth={1.5} />
        </Link>
        <div className="flex-1 text-center mx-3">
          <p className="text-white font-bold text-base leading-tight">Minha sacola</p>
          <p className="text-white/70 text-xs leading-tight">
            {items.length} {items.length === 1 ? "procedimento" : "procedimentos"} · {formatDuration(totalDurationMinutes)}
          </p>
        </div>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Item cards */}
        {items.map((item) => {
          const imageUrl = item.imageUrl ?? `https://placehold.co/120x120/E0C5AC/5F4B3C?text=Vi`;
          return (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#EDD9C5]">
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={imageUrl.includes("placehold.co")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#3D2B1F] text-sm leading-tight truncate">{item.name}</p>
                <p className="text-[#8B6B5A] text-xs flex items-center gap-1 mt-0.5">
                  <Clock size={10} strokeWidth={1.5} />
                  {formatDuration(item.durationMinutes)}
                </p>
                <p className="font-bold text-[#5F4B3C] text-sm mt-0.5">{formatPrice(item.priceInCents)}</p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shrink-0"
                aria-label="Remover"
              >
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            </div>
          );
        })}

        {/* Add more button */}
        <Link
          href="/procedimentos"
          className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E0C5AC] rounded-2xl py-4 text-[#5F4B3C] text-sm font-medium hover:bg-[#EDD9C5] transition-colors"
        >
          + Adicionar mais procedimentos
        </Link>

        {/* Summary card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-[#3D2B1F] mb-3">Resumo do agendamento</h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#8B6B5A]">Duração total</span>
            <span className="text-sm text-[#3D2B1F] font-medium flex items-center gap-1">
              <Clock size={13} strokeWidth={1.5} /> {formatDuration(totalDurationMinutes)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#F5EBE0]">
            <span className="text-sm text-[#8B6B5A]">Valor dos procedimentos</span>
            <span className="font-bold text-[#3D2B1F]">{formatPrice(totalProcedures)}</span>
          </div>
        </div>

        {/* Total dark card */}
        <div className="bg-[#3D2B1F] rounded-2xl p-5 flex items-center justify-between">
          <p className="text-white/70 text-sm">Valor total</p>
          <p className="text-white font-bold text-2xl">{formatPrice(totalProcedures)}</p>
        </div>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E0C5AC] px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push("/agendar")}
            className="w-full bg-[#5F4B3C] text-white rounded-full py-3.5 text-sm font-semibold hover:bg-[#4a3a2d] transition-colors flex items-center justify-center gap-2"
          >
            Escolher data e horário
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </main>
  );
}
