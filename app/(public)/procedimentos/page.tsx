import { db } from "@/lib/db";
import { CartButton } from "@/components/cart/cart-button";
import { CatalogClient } from "./catalog-client";

export const dynamic = "force-dynamic";

export default async function ProcedimentosPage() {
  const [procedures, categories] = await Promise.all([
    db.procedure.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
      },
      orderBy: { order: "asc" },
    }),
    db.procedureCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-[#F5EBE0] border-b border-[#E0C5AC] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[#3D2B1F]">
              Escolha seus procedimentos
            </h1>
            <p className="text-xs text-[#8B6B5A]">
              Monte seu agendamento do seu jeito
            </p>
          </div>
          <CartButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <CatalogClient
          procedures={procedures.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            shortDescription: p.shortDescription,
            priceInCents: p.priceInCents,
            durationMinutes: p.durationMinutes,
            badge: p.badge,
            categoryId: p.categoryId,
            images: p.images,
          }))}
          categories={categories}
        />
      </div>
    </main>
  );
}
