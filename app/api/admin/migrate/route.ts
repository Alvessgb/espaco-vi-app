import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SECRET = "vi2025migrate";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action");

  // Lista todos os procedimentos de sobrancelhas para identificar o original
  if (action === "list-sobrancelhas") {
    const procs = await db.procedure.findMany({
      where: { category: { name: { contains: "Sobrancelha", mode: "insensitive" } } },
      include: { images: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(procs.map(p => ({ id: p.id, slug: p.slug, name: p.name, status: p.status, duration: p.durationMinutes, images: p.images.map(i => i.url) })));
  }

  // Apaga o procedimento errado criado anteriormente
  if (action === "delete-wrong") {
    await db.procedureImage.deleteMany({ where: { procedure: { slug: "brow-design-coloracao" } } });
    await db.procedure.deleteMany({ where: { slug: "brow-design-coloracao" } });
    return NextResponse.json({ ok: true });
  }

  // Restaura "Brow + Design com coloração" com os dados originais + duração 90min
  if (action === "restore-brow-design-coloracao") {
    const category = await db.procedureCategory.findFirst({
      where: { name: { contains: "Sobrancelha", mode: "insensitive" } },
    });
    if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

    const existing = await db.procedure.findUnique({ where: { slug: "brow-lamination-design-coloracao" } });
    if (existing) {
      await db.procedure.update({ where: { slug: "brow-lamination-design-coloracao" }, data: { durationMinutes: 90 } });
      return NextResponse.json({ ok: true, msg: "duração atualizada", id: existing.id });
    }

    // Pegar order do "Brow + Design" para colocar logo depois
    const browDesign = await db.procedure.findFirst({ where: { slug: "brow-lamination-design" } });
    const refOrder = browDesign?.order ?? 10;

    // Empurrar procedimentos posteriores para abrir espaço
    await db.procedure.updateMany({
      where: { categoryId: category.id, order: { gte: refOrder + 1 } },
      data: { order: { increment: 1 } },
    });

    const procedure = await db.procedure.create({
      data: {
        slug: "brow-lamination-design-coloracao",
        name: "Brow + Design com coloração",
        shortDescription: "Laminação de sobrancelhas combinada com design personalizado e coloração para um resultado completo e duradouro.",
        durationMinutes: 90,
        priceInCents: null,
        status: "PRICE_TO_CONFIRM",
        categoryId: category.id,
        order: refOrder + 1,
        images: {
          create: [{ url: "/procedures/brow-lamination-design.jpg", order: 0 }],
        },
      },
    });

    return NextResponse.json({ ok: true, id: procedure.id, name: procedure.name });
  }

  return NextResponse.json({ error: "action inválida" }, { status: 400 });
}
