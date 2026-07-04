"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, ChevronRight, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { Drawer } from "antd";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
  title?: string;
  subtitle?: string;
  showCart?: boolean;
  showMenu?: boolean;
}

export function Header({
  showBack = false,
  backHref = "/procedimentos",
  title,
  subtitle,
  showCart = true,
  showMenu = true,
}: HeaderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = status === "authenticated" && (session?.user as any)?.role === "ADMIN";
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    function sync() { setCartCount(getCart().length); }
    sync();
    window.addEventListener("vi:cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vi:cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#5F4B3C]">
        <div className="flex items-center justify-between px-4 py-3">
          {showBack ? (
            <button
              onClick={() => router.push(backHref)}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white"
              aria-label="Voltar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <div>
              <p className="text-white font-bold text-base leading-tight">Espaço Vi</p>
              <p className="text-white/60 text-xs leading-tight">por Victoria Aragão</p>
            </div>
          )}

          {title && (
            <div className="text-center flex-1 mx-3">
              <p className="text-white font-bold text-base leading-tight">{title}</p>
              {subtitle && <p className="text-white/70 text-xs leading-tight">{subtitle}</p>}
            </div>
          )}

          <div className="flex items-center gap-2">
            {showCart && (
              <Link
                href="/carrinho"
                className="relative w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white"
                aria-label="Ver carrinho"
              >
                <ShoppingBag size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#5F4B3C] text-[10px] flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {showMenu && (
              <button
                onClick={() => setMenuOpen(true)}
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white"
                aria-label="Menu"
              >
                <Menu size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="right"
        width={300}
        closable={false}
        styles={{ body: { padding: 0, background: "#F5EBE0" }, header: { display: "none" } }}
      >
        <div className="flex flex-col h-full bg-[#F5EBE0]">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <p className="text-[#3D2B1F] font-bold text-lg leading-tight">Espaço Vi</p>
              <p className="text-[#8B6B5A] text-sm leading-tight">by Victoria Aragão</p>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 rounded-full bg-[#E0C5AC] flex items-center justify-center text-[#5F4B3C]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-px bg-[#E0C5AC] mx-5" />

          {/* Nav */}
          <nav className="flex flex-col mt-2">
            {/* Always visible */}
            <NavItem icon="✦" label="Catálogo de serviços" href="/procedimentos" onClick={() => setMenuOpen(false)} />
            <NavItem icon="📅" label="Meus agendamentos"   href="/meus-agendamentos" onClick={() => setMenuOpen(false)} />

            <div className="h-px bg-[#E0C5AC] mx-5 my-1" />

            {/* Account / auth section */}
            {isLoggedIn ? (
              <>
                <NavItem icon="👤" label="Minha conta" href="/conta" onClick={() => setMenuOpen(false)} />
                {isAdmin && (
                  <NavItem icon="⚙️" label="Área da Victoria" href="/victoria/pendentes" onClick={() => setMenuOpen(false)} />
                )}
              </>
            ) : (
              <>
                {/* Entrar */}
                <Link
                  href="/conta"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#EDD9C5] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5F4B3C] flex items-center justify-center shrink-0">
                      <LogIn size={15} strokeWidth={1.5} className="text-white" />
                    </div>
                    <span className="text-[#3D2B1F] font-semibold text-sm">Entrar</span>
                  </div>
                  <ChevronRight size={16} className="text-[#8B6B5A]" />
                </Link>
                {/* Criar conta */}
                <Link
                  href="/conta?tab=criar"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#EDD9C5] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E0C5AC] flex items-center justify-center shrink-0">
                      <UserPlus size={15} strokeWidth={1.5} className="text-[#5F4B3C]" />
                    </div>
                    <span className="text-[#3D2B1F] font-medium text-sm">Criar conta</span>
                  </div>
                  <ChevronRight size={16} className="text-[#8B6B5A]" />
                </Link>
              </>
            )}
          </nav>

          <div className="mt-auto pb-10 px-5 text-center">
            <p className="text-[#8B6B5A] text-xs">Espaço Vi · Estúdio de Estética</p>
            <p className="text-[#C4A080] text-xs">@espacovi</p>
          </div>
        </div>
      </Drawer>
    </>
  );
}

function NavItem({ icon, label, href, onClick }: { icon: string; label: string; href: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-5 py-4 hover:bg-[#EDD9C5] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-[#3D2B1F] font-medium text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className="text-[#8B6B5A]" />
    </Link>
  );
}
