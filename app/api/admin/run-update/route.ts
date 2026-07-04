import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SECRET = "vi2025check";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action");

  if (action === "fix-blonde") {
    // Set Blonde Brows to ACTIVE
    const updated = await db.procedure.update({
      where: { slug: "blonde-brows" },
      data: { status: "ACTIVE" },
    });
    return NextResponse.json({ ok: true, status: updated.status });
  }

  if (action === "fix-photos") {
    const updates: { slug: string; url: string }[] = [
      { slug: "design-com-coloracao", url: "/procedures/design-coloracao.jpg" },
      { slug: "nanoblading",          url: "/procedures/nanoblading.jpg" },
      { slug: "retoque-nanoblading",  url: "/procedures/retoque-nanoblading.jpg" },
    ];

    const results: Record<string, boolean> = {};
    for (const { slug, url } of updates) {
      const proc = await db.procedure.findUnique({ where: { slug } });
      if (proc) {
        await db.procedureImage.deleteMany({ where: { procedureId: proc.id } });
        await db.procedureImage.create({ data: { procedureId: proc.id, url, order: 0 } });
        results[slug] = true;
      } else {
        results[slug] = false;
      }
    }
    return NextResponse.json({ ok: true, results });
  }

  // Default: status check
  const blonde = await db.procedure.findUnique({ where: { slug: "blonde-brows" }, include: { images: true } });
  const design = await db.procedure.findUnique({ where: { slug: "design-com-coloracao" }, include: { images: true } });
  const nano = await db.procedure.findUnique({ where: { slug: "nanoblading" }, include: { images: true } });
  const retoque = await db.procedure.findUnique({ where: { slug: "retoque-nanoblading" }, include: { images: true } });
  return NextResponse.json({
    blonde: blonde ? { id: blonde.id, status: blonde.status, images: blonde.images } : null,
    design: design?.images,
    nano: nano?.images,
    retoque: retoque?.images,
  });
}
