import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VictoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // @ts-expect-error — role is on session.user
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0]">
      {/* Header */}
      <header className="bg-[#5F4B3C] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-poppins font-semibold text-base">Área da Victoria</span>
        <Link href="/" className="text-[#E0C5AC] text-sm font-poppins hover:text-white transition-colors">
          Site
        </Link>
      </header>

      {/* Nav tabs */}
      <nav className="bg-white border-b border-[#E0C5AC] overflow-x-auto">
        <div className="flex px-2 min-w-max">
          <NavTab href="/victoria/agenda/dia" label="Dia" />
          <NavTab href="/victoria/agenda/semana" label="Semana" />
          <NavTab href="/victoria/agenda/mes" label="Mês" />
          <NavTab href="/victoria/painel" label="Painel" />
          <NavTab href="/victoria/procedimentos" label="Procedimentos" />
          <NavTab href="/victoria/bloqueios" label="Bloqueios" />
        </div>
      </nav>

      {children}
    </div>
  );
}

function NavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 font-poppins text-sm font-medium text-[#8B6B5A] hover:text-[#5F4B3C] border-b-2 border-transparent hover:border-[#5F4B3C] transition-colors whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
