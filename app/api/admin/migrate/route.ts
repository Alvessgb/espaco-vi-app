import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SECRET = "vi2025migrate";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action");

  if (action === "add-brow-design-coloracao") {
    // Buscar categoria sobrancelhas
    const category = await db.procedureCategory.findFirst({
      where: { name: { contains: "Sobrancelha", mode: "insensitive" } },
    });
    if (!category) return NextResponse.json({ error: "Categoria sobrancelhas não encontrada" }, { status: 404 });

    // Verificar se já existe
    const existing = await db.procedure.findUnique({ where: { slug: "brow-design-coloracao" } });
    if (existing) return NextResponse.json({ ok: true, msg: "já existe", id: existing.id });

    // Pegar maior order da categoria para colocar em sequência
    const lastInCategory = await db.procedure.findFirst({
      where: { categoryId: category.id },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastInCategory?.order ?? 0) + 1;

    const procedure = await db.procedure.create({
      data: {
        slug: "brow-design-coloracao",
        name: "Brow + Design + Coloração",
        shortDescription: "Laminação de sobrancelhas com design personalizado e coloração para realçar e definir o olhar.",
        durationMinutes: 90,
        priceInCents: null,
        status: "PRICE_TO_CONFIRM",
        categoryId: category.id,
        order: nextOrder,
        images: {
          create: [{ url: "/procedures/brow-lamination-design.jpg", order: 0 }],
        },
      },
    });

    return NextResponse.json({ ok: true, id: procedure.id, name: procedure.name });
  }

  return NextResponse.json({ error: "action inválida" }, { status: 400 });
}
