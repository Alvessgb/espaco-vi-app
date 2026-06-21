"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getCart } from "@/lib/cart";

export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      setCount(getCart().length);
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("vi:cart-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("vi:cart-updated", sync);
    };
  }, []);

  return (
    <Link
      href="/carrinho"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E0C5AC] hover:bg-[#F5EBE0] transition-colors"
      aria-label="Ver carrinho"
    >
      <ShoppingBag size={18} className="text-[#5F4B3C]" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#5F4B3C] text-white text-xs flex items-center justify-center font-medium">
          {count}
        </span>
      )}
    </Link>
  );
}
