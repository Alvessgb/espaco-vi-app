"use client";

import { useState, useEffect } from "react";
import { addToCart, removeFromCart, getCart } from "@/lib/cart";
import { Check } from "lucide-react";

interface CartItemInput {
  id: string;
  slug: string;
  name: string;
  priceInCents: number | null;
  durationMinutes: number | null;
  imageUrl?: string;
}

interface Props {
  item: CartItemInput;
  variant?: "outline" | "solid";
}

export function AddToCartButton({ item, variant = "solid" }: Props) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    function sync() {
      setInCart(getCart().some((i) => i.id === item.id));
    }
    sync();
    window.addEventListener("vi:cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vi:cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [item.id]);

  function handleToggle() {
    if (inCart) {
      removeFromCart(item.id);
      setInCart(false);
    } else {
      addToCart(item);
      setInCart(true);
    }
    window.dispatchEvent(new Event("vi:cart-updated"));
  }

  if (variant === "outline") {
    return (
      <button
        onClick={handleToggle}
        className={`flex-1 rounded-full py-3 text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 ${
          inCart
            ? "border-[#5F4B3C] bg-[#5F4B3C] text-white"
            : "border-[#5F4B3C] text-[#5F4B3C] hover:bg-[#F5EBE0]"
        }`}
      >
        {inCart ? <><Check size={14} /> Adicionado</> : "+ Adicionar"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
        inCart
          ? "bg-[#E0C5AC] text-[#5F4B3C]"
          : "bg-[#5F4B3C] text-white hover:bg-[#4a3a2d]"
      }`}
    >
      {inCart ? "✓ Adicionado ao carrinho" : "+ Adicionar ao carrinho"}
    </button>
  );
}
