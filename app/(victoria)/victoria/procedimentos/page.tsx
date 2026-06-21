import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ds/status-badge";
import type { ProcedureStatus } from "@prisma/client";

function formatPrice(cents: number | null) {
  if (cents === null) return "A confirmar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

const statusConfig: Record<ProcedureStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Ativo", className: "bg-[#4CAF50]/15 text-[#2E7D32]" },
  UNAVAILABLE: { label: "Indisponível", className: "bg-gray-100 text-gray-500" },
  MISSING_PHOTO: { label: "Sem foto", className: "bg-[#F9A825]/20 text-[#E65100]" },
  PRICE_TO_CONFIRM: { label: "Preço a confirmar", className: "bg-blue-50 text-blue-700" },
  REMOVED: { label: "Removido", className: "bg-[#E53935]/10 text-[#C62828]" },
};

function ProcedureStatusBadge({ status }: { status: ProcedureStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-poppins text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default async function ProcedimentosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { q, category, status } = await searchParams;

  const [procedures, categories] = await Promise.all([
    db.procedure.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(category ? { categoryId: category } : {}),
        ...(status ? { status: status as ProcedureStatus } : {}),
      },
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }, { name: "asc" }],
    }),
    db.procedureCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl">Procedimentos</h1>
        <Link
          href="/victoria/procedimentos/novo"
          className="text-sm bg-[#5F4B3C] text-white rounded-full px-4 py-2 font-poppins hover:bg-[#4a3a2d] transition-colors"
        >
          + Novo
        </Link>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar procedimento..."
          className="flex-1 border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
        />
        <select
          name="category"
          defaultValue={category}
          className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins bg-white focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
        >
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins bg-white focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
        >
          <option value="">Todos status</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-[#5F4B3C] text-white rounded-lg px-4 py-2 text-sm font-poppins hover:bg-[#4a3a2d] transition-colors">
          Filtrar
        </button>
      </form>

      {procedures.length === 0 ? (
        <p className="font-poppins text-[#8B6B5A] text-sm">Nenhum procedimento encontrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {procedures.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-[#E0C5AC] p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-poppins font-medium text-[#3D2B1F] text-sm truncate">{p.name}</p>
                <p className="font-poppins text-xs text-[#8B6B5A]">
                  {p.category.name} · {p.durationMinutes}min · {formatPrice(p.priceInCents)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ProcedureStatusBadge status={p.status} />
                <Link
                  href={`/victoria/procedimentos/${p.id}/editar`}
                  className="text-xs text-[#5F4B3C] border border-[#E0C5AC] rounded-full px-3 py-1 font-poppins hover:bg-[#F5EBE0] transition-colors"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
