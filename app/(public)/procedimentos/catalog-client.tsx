"use client";

import { useState, useEffect } from "react";
import { ProcedureCard } from "@/components/ds/procedure-card";
import { addToCart, removeFromCart, getCart } from "@/lib/cart";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Procedure {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  priceInCents: number;
  durationMinutes: number;
  badge: string | null;
  categoryId: string;
  images: { url: string; isPrimary: boolean }[];
}

interface Props {
  procedures: Procedure[];
  categories: Category[];
}

export function CatalogClient({ procedures, categories }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    function sync() {
      setCartIds(new Set(getCart().map((i) => i.id)));
    }
    sync();
    window.addEventListener("vi:cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vi:cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function dispatchCartUpdate() {
    window.dispatchEvent(new Event("vi:cart-updated"));
  }

  function handleAdd(p: Procedure) {
    const primaryImage = p.images.find((i) => i.isPrimary) ?? p.images[0];
    addToCart({
      id: p.id,
      slug: p.slug,
      name: p.name,
      priceInCents: p.priceInCents,
      durationMinutes: p.durationMinutes,
      imageUrl: primaryImage?.url,
    });
    setCartIds((prev) => new Set(prev).add(p.id));
    dispatchCartUpdate();
  }

  function handleRemove(id: string) {
    removeFromCart(id);
    setCartIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    dispatchCartUpdate();
  }

  const filtered = procedures.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === null || p.categoryId === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar procedimento..."
        className="w-full border border-[#E0C5AC] rounded-full px-4 py-2.5 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] transition-colors bg-white"
      />

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            activeCategory === null
              ? "bg-[#5F4B3C] text-white border-[#5F4B3C]"
              : "bg-white text-[#5F4B3C] border-[#E0C5AC] hover:bg-[#F5EBE0]"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setActiveCategory(activeCategory === cat.id ? null : cat.id)
            }
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeCategory === cat.id
                ? "bg-[#5F4B3C] text-white border-[#5F4B3C]"
                : "bg-white text-[#5F4B3C] border-[#E0C5AC] hover:bg-[#F5EBE0]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-[#8B6B5A] text-center py-10">
          Nenhum procedimento encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const primaryImage = p.images.find((i) => i.isPrimary) ?? p.images[0];
            const inCart = cartIds.has(p.id);
            return (
              <ProcedureCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                shortDescription={p.shortDescription ?? undefined}
                price={p.priceInCents}
                durationMinutes={p.durationMinutes}
                imageUrl={primaryImage?.url}
                badge={p.badge ?? undefined}
                isInCart={inCart}
                onAdd={() => (inCart ? handleRemove(p.id) : handleAdd(p))}
                onViewDetails={() => router.push(`/procedimentos/${p.slug}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
