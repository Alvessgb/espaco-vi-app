"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart, removeFromCart, getCart, type CartItem } from "@/lib/cart";

interface Props {
  item: CartItem;
}

export function AddToCartButton({ item }: Props) {
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

  function toggle() {
    if (inCart) {
      removeFromCart(item.id);
      setInCart(false);
    } else {
      addToCart(item);
      setInCart(true);
    }
    window.dispatchEvent(new Event("vi:cart-updated"));
  }

  return (
    <div className="flex flex-col gap-2 mt-1">
      <button
        onClick={toggle}
        className={`w-full rounded-full py-3 text-sm font-medium transition-colors ${
          inCart
            ? "bg-[#E0C5AC] text-[#5F4B3C] hover:bg-[#d4b49a]"
            : "bg-[#5F4B3C] text-white hover:bg-[#4a3a2d]"
        }`}
      >
        {inCart ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
      {inCart && (
        <Link
          href="/carrinho"
          className="w-full text-center rounded-full py-2.5 text-sm font-medium bg-white border border-[#E0C5AC] text-[#5F4B3C] hover:bg-[#F5EBE0] transition-colors"
        >
          Ver carrinho
        </Link>
      )}
    </div>
  );
}
