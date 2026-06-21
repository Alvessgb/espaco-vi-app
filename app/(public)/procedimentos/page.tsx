import { db } from "@/lib/db";
import { CatalogClient } from "./catalog-client";

export const dynamic = "force-dynamic";

export default async function ProcedimentosPage() {
  let procedures: Parameters<typeof CatalogClient>[0]["procedures"] = [];
  let categories: Parameters<typeof CatalogClient>[0]["categories"] = [];

  try {
    if (db) {
      const [procs, cats] = await Promise.all([
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
      procedures = procs.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        priceInCents: p.priceInCents,
        durationMinutes: p.durationMinutes,
        badge: p.badge,
        categoryId: p.categoryId,
        images: p.images,
      }));
      categories = cats;
    }
  } catch (err) {
    console.error("[procedimentos] DB error:", err);
  }

  return <CatalogClient procedures={procedures} categories={categories} />;
}
