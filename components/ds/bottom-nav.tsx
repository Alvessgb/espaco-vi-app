"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarDays, User } from "lucide-react";

const items = [
  { href: "/procedimentos", icon: LayoutGrid, label: "Catálogo" },
  { href: "/meus-agendamentos", icon: CalendarDays, label: "Agendamentos" },
  { href: "/conta", icon: User, label: "Conta" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0C5AC] safe-area-pb">
      <div className="flex items-center">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                active ? "text-[#5F4B3C]" : "text-[#C4A080]"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className={`text-[10px] font-medium ${active ? "text-[#5F4B3C]" : "text-[#C4A080]"}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-[#5F4B3C] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
