"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ShoppingBag, Search, Menu, X, ChevronRight, LayoutGrid, User, CalendarDays, Settings } from "lucide-react";
import { addToCart, removeFromCart, getCart } from "@/lib/cart";
import { Drawer } from "antd";

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
  priceInCents: number | null;
  durationMinutes: number | null;
  badge: string | null;
  categoryId: string;
  images: { url: string; isPrimary: boolean }[];
}

interface Props {
  procedures: Procedure[];
  categories: Category[];
}

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

export function CatalogClient({ procedures, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function sync() {
      const cart = getCart();
      setCartIds(new Set(cart.map((i) => i.id)));
      setCartCount(cart.length);
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

  const filtered = procedures.filter((p) =>
    activeCategory === null || p.categoryId === activeCategory
  );

  const navItems = [
    { icon: <LayoutGrid size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Catálogo de serviços", href: "/procedimentos" },
    { icon: <User size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Minha conta", href: "/conta" },
    { icon: <CalendarDays size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Meus agendamentos", href: "/meus-agendamentos" },
    { icon: <Settings size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Área da Victoria", href: "/victoria" },
  ];

  return (
    <div className="min-h-screen bg-[#5F4B3C]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#5F4B3C] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold text-base leading-tight">Espaço Vi</p>
            <p className="text-white/60 text-xs leading-tight">por Victoria Aragão</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white">
              <Search size={16} strokeWidth={1.5} />
            </button>
            <Link
              href="/carrinho"
              className="relative w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white"
              aria-label="Ver carrinho"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#5F4B3C] text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white"
              aria-label="Menu"
            >
              <Menu size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-4">
          <h1 className="text-white text-2xl font-bold leading-tight">
            Olá! Escolha seu procedimento ✨
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Beleza, cuidado e sofisticação para você
          </p>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeCategory === null
                ? "bg-white text-[#5F4B3C] border-white"
                : "bg-transparent border-white/30 text-white"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activeCategory === cat.id
                  ? "bg-white text-[#5F4B3C] border-white"
                  : "bg-transparent border-white/30 text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Cards section */}
      <div className="bg-[#F5EBE0] rounded-t-3xl min-h-screen">
        <div className="flex flex-col gap-4 px-4 pt-5 pb-8">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#8B6B5A] text-center py-10">
              Nenhum procedimento encontrado.
            </p>
          ) : (
            filtered.map((p) => {
              const primaryImage = p.images.find((i) => i.isPrimary) ?? p.images[0];
              const inCart = cartIds.has(p.id);
              const imageUrl = primaryImage?.url ?? `https://placehold.co/400x300/E0C5AC/5F4B3C?text=${encodeURIComponent(p.name)}`;

              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Image */}
                  <div className="relative w-full aspect-video">
                    <Image
                      src={imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 640px"
                      unoptimized={imageUrl.includes("placehold.co")}
                    />
                    {/* Badge overlay top-left */}
                    {p.badge && (
                      <span className="absolute top-3 left-3 bg-[#E0C5AC] text-[#5F4B3C] text-xs font-medium px-3 py-1 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    {/* Duration badge bottom-right */}
                    <span className="absolute bottom-3 right-3 bg-white text-[#5F4B3C] text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock size={11} strokeWidth={1.5} />
                      {formatDuration(p.durationMinutes)}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#3D2B1F] text-base leading-tight">{p.name}</h3>
                      <span className="font-bold text-[#5F4B3C] text-base whitespace-nowrap">
                        {formatPrice(p.priceInCents)}
                      </span>
                    </div>
                    {p.shortDescription && (
                      <p className="text-sm text-[#8B6B5A] mb-3 leading-snug">{p.shortDescription}</p>
                    )}
                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/procedimentos/${p.slug}`}
                        className="flex-1 text-center py-2.5 rounded-full border border-[#5F4B3C] text-[#5F4B3C] text-sm font-medium hover:bg-[#F5EBE0] transition-colors"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => inCart ? handleRemove(p.id) : handleAdd(p)}
                        className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
                          inCart
                            ? "bg-[#E0C5AC] text-[#5F4B3C]"
                            : "bg-[#5F4B3C] text-white hover:bg-[#4a3a2d]"
                        }`}
                      >
                        {inCart ? "✓ Adicionado" : "+ Adicionar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Menu Drawer */}
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="right"
        width={300}
        closable={false}
        styles={{ body: { padding: 0, background: "#F5EBE0" }, header: { display: "none" } }}
      >
        <div className="flex flex-col h-full bg-[#F5EBE0]">
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <p className="text-[#3D2B1F] font-bold text-lg leading-tight">Espaço Vi</p>
              <p className="text-[#8B6B5A] text-sm leading-tight">by Victoria Aragão</p>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 rounded-full bg-[#E0C5AC] flex items-center justify-center text-[#5F4B3C]"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="h-px bg-[#E0C5AC] mx-5" />
          <nav className="flex flex-col mt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#EDD9C5] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                  <span className="text-[#3D2B1F] font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} className="text-[#8B6B5A]" />
              </Link>
            ))}
          </nav>
          <div className="mt-auto pb-8 px-5 text-center">
            <p className="text-[#8B6B5A] text-xs">Espaço Vi · Estúdio de Estética</p>
            <p className="text-[#8B6B5A] text-xs">@espacovi</p>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
