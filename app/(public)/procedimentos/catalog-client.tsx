"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock, ShoppingBag, Search, Menu, X, ChevronRight,
  LayoutGrid, User, CalendarDays, LayoutDashboard, LayoutList,
} from "lucide-react";
import { addToCart, removeFromCart, getCart } from "@/lib/cart";
import { Drawer } from "antd";

interface Category { id: string; name: string; slug: string; }
interface Procedure {
  id: string; slug: string; name: string;
  shortDescription: string | null; priceInCents: number | null;
  durationMinutes: number | null; badge: string | null;
  categoryId: string; images: { url: string; isPrimary: boolean }[];
}
interface Props { procedures: Procedure[]; categories: Category[]; isAdmin?: boolean; }

function formatPrice(cents: number | null) {
  if (cents === null) return "A confirmar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

type ViewMode = "grid" | "list";

export function CatalogClient({ procedures, categories, isAdmin = false }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartIds, setCartIds]     = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState("");
  const [viewMode, setViewMode]     = useState<ViewMode>("list");
  const searchRef = useRef<HTMLInputElement>(null);

  const visibleCategories = categories.filter(c => c.slug !== "nao-realizado");

  useEffect(() => {
    function sync() {
      const cart = getCart();
      setCartIds(new Set(cart.map(i => i.id)));
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

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  function dispatch() { window.dispatchEvent(new Event("vi:cart-updated")); }

  function handleAdd(p: Procedure) {
    const img = p.images.find(i => i.isPrimary) ?? p.images[0];
    addToCart({ id: p.id, slug: p.slug, name: p.name, priceInCents: p.priceInCents, durationMinutes: p.durationMinutes, imageUrl: img?.url });
    setCartIds(prev => new Set(prev).add(p.id));
    dispatch();
  }
  function handleRemove(id: string) {
    removeFromCart(id);
    setCartIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    dispatch();
  }

  const filtered = procedures.filter(p => {
    const matchCat = activeCategory === null || p.categoryId === activeCategory;
    const matchQ   = query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const navItems = [
    { icon: <LayoutGrid size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Catálogo de serviços", href: "/procedimentos" },
    { icon: <User size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />,       label: "Minha conta",         href: "/conta" },
    { icon: <CalendarDays size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Meus agendamentos", href: "/meus-agendamentos" },
    ...(isAdmin ? [
      { icon: <LayoutDashboard size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Painel", href: "/victoria/pendentes" },
      { icon: <User size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Usuários", href: "/victoria/usuarios" },
      { icon: <CalendarDays size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />, label: "Agendamentos", href: "/victoria/agendamentos" },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#5F4B3C]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#5F4B3C] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-base leading-tight">Espaço Vi</p>
            <p className="text-white/60 text-xs leading-tight">por Victoria Aragão</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => { setSearchOpen(v => !v); setQuery(""); }}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white"
              aria-label="Buscar"
            >
              {searchOpen ? <X size={16} strokeWidth={1.5} /> : <Search size={16} strokeWidth={1.5} />}
            </button>

            {/* View toggle — between search and cart */}
            <button
              onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white transition-colors"
              aria-label={viewMode === "grid" ? "Visualização em lista" : "Visualização em cards"}
            >
              {viewMode === "grid"
                ? <LayoutList size={16} strokeWidth={1.5} />
                : <LayoutGrid size={16} strokeWidth={1.5} />}
            </button>

            {/* Cart */}
            <Link href="/carrinho" className="relative w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white" aria-label="Carrinho">
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#5F4B3C] text-[10px] flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </Link>

            {/* Menu */}
            <button onClick={() => setMenuOpen(true)} className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white" aria-label="Menu">
              <Menu size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Search input */}
        {searchOpen && (
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 mb-3">
            <Search size={15} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar procedimento..."
              className="flex-1 text-sm text-[#3D2B1F] outline-none bg-transparent placeholder:text-[#C4A080]"
            />
            {query && <button onClick={() => setQuery("")} className="text-[#8B6B5A]"><X size={14} strokeWidth={1.5} /></button>}
          </div>
        )}

        {/* Hero text */}
        {!searchOpen && (
          <div className="mb-3">
            <h1 className="text-white text-2xl font-bold leading-tight">Olá! Escolha seu procedimento ✨</h1>
            <p className="text-white/70 text-sm mt-0.5">Beleza, cuidado e sofisticação para você</p>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setActiveCategory(null)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeCategory === null ? "bg-white text-[#5F4B3C] border-white" : "bg-transparent border-white/30 text-white"}`}>
            Todos
          </button>
          {visibleCategories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeCategory === cat.id ? "bg-white text-[#5F4B3C] border-white" : "bg-transparent border-white/30 text-white"}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Cards area */}
      <div className="bg-[#F5EBE0] rounded-t-3xl min-h-screen">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#8B6B5A]">
              {query ? `Nenhum resultado para "${query}"` : "Nenhum procedimento encontrado."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ── GRID VIEW: large portrait cards ── */
          <div className="flex flex-col gap-4 px-4 pt-5 pb-32">
            {filtered.map(p => {
              const img = p.images.find(i => i.isPrimary) ?? p.images[0];
              const inCart = cartIds.has(p.id);
              const imageUrl = img?.url ?? `https://placehold.co/400x300/E0C5AC/5F4B3C?text=${encodeURIComponent(p.name)}`;
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="relative w-full" style={{ paddingBottom: "133%" }}>
                    <Image src={imageUrl} alt={p.name} fill className="object-cover object-top" sizes="(max-width:640px) 100vw, 640px" unoptimized={imageUrl.includes("placehold.co")} />
                    {p.badge && <span className="absolute top-3 left-3 bg-[#E0C5AC] text-[#5F4B3C] text-xs font-medium px-3 py-1 rounded-full">{p.badge}</span>}
                    <span className="absolute bottom-3 right-3 bg-white text-[#5F4B3C] text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock size={11} strokeWidth={1.5} />{formatDuration(p.durationMinutes)}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#3D2B1F] text-base leading-tight">{p.name}</h3>
                      <span className="font-bold text-[#5F4B3C] text-base whitespace-nowrap">{formatPrice(p.priceInCents)}</span>
                    </div>
                    {p.shortDescription && <p className="text-sm text-[#8B6B5A] mb-3 leading-snug">{p.shortDescription}</p>}
                    <div className="flex gap-2">
                      <Link href={`/procedimentos/${p.slug}`} className="flex-1 text-center py-2.5 rounded-full border border-[#5F4B3C] text-[#5F4B3C] text-sm font-medium hover:bg-[#F5EBE0] transition-colors">
                        Ver detalhes
                      </Link>
                      <button onClick={() => inCart ? handleRemove(p.id) : handleAdd(p)} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${inCart ? "bg-[#E0C5AC] text-[#5F4B3C]" : "bg-[#5F4B3C] text-white hover:bg-[#4a3a2d]"}`}>
                        {inCart ? "✓ Adicionado" : "+ Adicionar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW: compact horizontal cards ── */
          <div className="flex flex-col gap-2 px-4 pt-5 pb-32">
            {filtered.map(p => {
              const img = p.images.find(i => i.isPrimary) ?? p.images[0];
              const inCart = cartIds.has(p.id);
              const imageUrl = img?.url ?? `https://placehold.co/300x400/E0C5AC/5F4B3C?text=${encodeURIComponent(p.name)}`;

              // In list view, only show Combo and Manutenção badges
              const badgeLower = (p.badge ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
              const showBadge = badgeLower === "combo" || badgeLower === "manutencao";

              return (
                <Link
                  key={p.id}
                  href={`/procedimentos/${p.slug}`}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden flex min-h-[100px] active:opacity-90 transition-opacity"
                >
                  {/* Image — fills full card height via self-stretch (no fixed h) */}
                  <div className="relative shrink-0 w-[108px] self-stretch">
                    <Image
                      src={imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover object-center"
                      sizes="108px"
                      unoptimized={imageUrl.includes("placehold.co")}
                    />
                    {/* Subtle gradient to anchor badge */}
                    {showBadge && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    )}
                    {showBadge && (
                      <span className="absolute bottom-2 left-2 bg-[#3D2B1F]/80 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full leading-tight backdrop-blur-sm">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 px-3.5 py-3.5 flex flex-col justify-between gap-2">
                    {/* Top: name + price */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#3D2B1F] text-[13px] leading-snug flex-1">{p.name}</h3>
                        <span className="font-bold text-[#5F4B3C] text-[13px] whitespace-nowrap shrink-0">{formatPrice(p.priceInCents)}</span>
                      </div>
                      {p.shortDescription && (
                        <p className="text-[11px] text-[#8B6B5A] leading-snug line-clamp-2 mt-1">{p.shortDescription}</p>
                      )}
                    </div>

                    {/* Bottom: duration + add button */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[#8B6B5A] text-[11px] font-medium">
                        <Clock size={11} strokeWidth={1.5} />
                        {formatDuration(p.durationMinutes)}
                      </span>
                      <button
                        onClick={e => { e.preventDefault(); inCart ? handleRemove(p.id) : handleAdd(p); }}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold transition-colors ${
                          inCart
                            ? "bg-[#E0C5AC] text-[#5F4B3C]"
                            : "bg-[#5F4B3C] text-white active:bg-[#4a3a2d]"
                        }`}
                      >
                        {inCart ? "✓ Adicionado" : "+ Adicionar"}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto">
          <Link href="/carrinho" className="flex items-center bg-[#3D2B1F] rounded-2xl px-4 py-3.5 shadow-2xl gap-3">
            <span className="w-7 h-7 rounded-full bg-white text-[#3D2B1F] text-xs font-bold flex items-center justify-center shrink-0">{cartCount}</span>
            <span className="flex-1 text-white text-sm font-semibold">{cartCount} {cartCount === 1 ? "procedimento" : "procedimentos"}</span>
            <span className="text-white text-sm font-medium">Ver sacola</span>
            <ShoppingBag size={16} strokeWidth={1.5} className="text-white" />
          </Link>
        </div>
      )}

      {/* Menu Drawer */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} placement="right" width={300} closable={false} styles={{ body: { padding: 0, background: "#F5EBE0" }, header: { display: "none" } }}>
        <div className="flex flex-col h-full bg-[#F5EBE0]">
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <p className="text-[#3D2B1F] font-bold text-lg leading-tight">Espaço Vi</p>
              <p className="text-[#8B6B5A] text-sm leading-tight">by Victoria Aragão</p>
            </div>
            <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-[#E0C5AC] flex items-center justify-center text-[#5F4B3C]">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="h-px bg-[#E0C5AC] mx-5" />
          <nav className="flex flex-col mt-2">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-5 py-4 hover:bg-[#EDD9C5] transition-colors">
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
          </div>
        </div>
      </Drawer>
    </div>
  );
}
