import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import type { ProcedureStatus } from "@prisma/client";

function formatPrice(cents: number | null) {
  if (cents === null) return "A confirmar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDuration(min: number | null) {
  if (!min) return "—";
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

const STATUS_BADGE: Record<ProcedureStatus, { label: string; className: string }> = {
  ACTIVE:           { label: "Ativo",             className: "bg-[#D8F3DC] text-[#2D6A4F]" },
  UNAVAILABLE:      { label: "Indisponível",      className: "bg-gray-100 text-gray-500" },
  MISSING_PHOTO:    { label: "Sem foto",          className: "bg-[#FFF3CD] text-[#856404]" },
  PRICE_TO_CONFIRM: { label: "Preço a confirmar", className: "bg-blue-50 text-blue-700" },
  REMOVED:          { label: "Removido",          className: "bg-red-50 text-red-600" },
};

export default async function ProcedimentosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { q, cat } = await searchParams;

  const [procedures, categories] = await Promise.all([
    db.procedure.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(cat ? { categoryId: cat } : {}),
      },
      include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }, { name: "asc" }],
    }),
    db.procedureCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  const activeOnly = procedures.filter(p => p.status !== "REMOVED");

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      {/* Header */}
      <div className="bg-[#3D2B1F] px-4 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">Procedimentos</h1>
          <p className="text-white/60 text-xs">{activeOnly.length} serviços cadastrados</p>
        </div>
        <a href={`/victoria/procedimentos?q=${q ?? ""}&cat=${cat ?? ""}`} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <Search size={16} strokeWidth={1.5} className="text-white" />
        </a>
      </div>

      {/* Search bar (shown when ?q is set or always visible) */}
      <form method="get" className="px-4 pt-3">
        <div className="relative mb-3">
          <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6B5A]" />
          <input
            name="q" defaultValue={q}
            placeholder="Buscar procedimento..."
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#3D2B1F] border border-[#E0C5AC] outline-none focus:border-[#5F4B3C]"
          />
          {cat && <input type="hidden" name="cat" value={cat} />}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <a
            href={`/victoria/procedimentos${q ? `?q=${q}` : ""}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${!cat ? "bg-[#3D2B1F] text-white" : "bg-white text-[#8B6B5A] border border-[#E0C5AC]"}`}
          >
            Todos
          </a>
          {categories.map(c => (
            <a
              key={c.id}
              href={`/victoria/procedimentos?cat=${c.id}${q ? `&q=${q}` : ""}`}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${cat === c.id ? "bg-[#3D2B1F] text-white" : "bg-white text-[#8B6B5A] border border-[#E0C5AC]"}`}
            >
              {c.name}
            </a>
          ))}
        </div>
      </form>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* Add new button */}
        <Link
          href="/victoria/procedimentos/novo"
          className="flex items-center justify-center gap-2 bg-[#3D2B1F] text-white rounded-2xl py-4 text-sm font-semibold"
        >
          <Plus size={16} strokeWidth={1.5} />
          Novo procedimento
        </Link>

        <p className="text-xs text-[#8B6B5A] font-medium">{activeOnly.length} procedimentos</p>

        {/* Procedure list */}
        {activeOnly.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E0C5AC] p-6 text-center">
            <p className="text-[#8B6B5A] text-sm">Nenhum procedimento encontrado.</p>
          </div>
        ) : (
          activeOnly.map(p => {
            const imageUrl = p.images[0]?.url;
            const badge = STATUS_BADGE[p.status];
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-[#E0C5AC] overflow-hidden shadow-sm">
                <div className="flex gap-3 p-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F5EBE0]">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={p.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C4A080] text-xl">✦</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#3D2B1F] text-sm leading-tight">{p.name}</p>
                    <p className="text-xs text-[#8B6B5A] mt-0.5">{p.category.name}</p>
                    <p className="text-xs text-[#5F4B3C] font-semibold mt-1">
                      {formatPrice(p.priceInCents)} · {formatDuration(p.durationMinutes)}
                    </p>
                    <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex border-t border-[#F5EBE0]">
                  <Link
                    href={`/victoria/procedimentos/${p.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-[#5F4B3C] font-medium border-r border-[#F5EBE0] hover:bg-[#F5EBE0] transition-colors"
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                    Editar
                  </Link>
                  <Link
                    href={`/victoria/procedimentos/${p.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                    Remover
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
