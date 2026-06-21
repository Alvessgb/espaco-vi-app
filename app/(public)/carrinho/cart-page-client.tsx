"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, removeFromCart, clearCart, type CartItem } from "@/lib/cart";
import { CartSummary } from "@/components/ds/cart-summary";
import Link from "next/link";

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

  function handleClear() {
    clearCart();
    setItems([]);
    window.dispatchEvent(new Event("vi:cart-updated"));
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EDD9C5] flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B6B5A"
            strokeWidth="1.5"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-[#3D2B1F]">
            Seu carrinho está vazio
          </p>
          <p className="text-sm text-[#8B6B5A] mt-1">
            Adicione procedimentos para continuar
          </p>
        </div>
        <Link
          href="/procedimentos"
          className="bg-[#5F4B3C] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-[#4a3a2d] transition-colors"
        >
          Escolher procedimentos
        </Link>
      </div>
    );
  }

  // Map CartItem to CartSummary's CartItem shape
  const summaryItems = items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.priceInCents,
    durationMinutes: i.durationMinutes,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#EDD9C5] rounded-2xl p-4 text-sm text-[#5F4B3C]">
        <p className="font-medium">
          Você selecionou {items.length}{" "}
          {items.length === 1 ? "procedimento" : "procedimentos"}
        </p>
      </div>

      <CartSummary
        items={summaryItems}
        onRemove={handleRemove}
        onClear={handleClear}
        onCheckout={() => router.push("/agendar")}
      />
    </div>
  );
}
