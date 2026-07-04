import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/conta");

  return (
    <div className="min-h-screen bg-[#F5EBE0]">
      <header className="bg-[#5F4B3C] px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/procedimentos"
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <div>
            <p className="text-white font-bold text-base leading-tight">Espaço Vi</p>
            <p className="text-white/60 text-xs">Área administrativa</p>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
