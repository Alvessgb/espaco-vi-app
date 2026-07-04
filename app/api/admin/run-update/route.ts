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
    // Restore correct photos for design, nanoblading, retoque-nanoblading
    const designSlug = "design-com-coloracao";
    const nanoSlug = "nanoblading";
    const retoqueSlug = "retoque-nanoblading";

    // Delete existing images first, then add correct ones
    await db.procedureImage.deleteMany({ where: { procedure: { slug: designSlug } } });
    await db.procedureImage.deleteMany({ where: { procedure: { slug: nanoSlug } } });
    await db.procedureImage.deleteMany({ where: { procedure: { slug: retoqueSlug } } });

    const design = await db.procedure.findUnique({ where: { slug: designSlug } });
    const nano = await db.procedure.findUnique({ where: { slug: nanoSlug } });
    const retoque = await db.procedure.findUnique({ where: { slug: retoqueSlug } });

    if (design) {
      await db.procedureImage.create({ data: { procedureId: design.id, url: "/procedures/design-coloracao.jpg", order: 0 } });
    }
    if (nano) {
      await db.procedureImage.create({ data: { procedureId: nano.id, url: "/procedures/nanoblading.jpg", order: 0 } });
    }
    if (retoque) {
      await db.procedureImage.create({ data: { procedureId: retoque.id, url: "/procedures/retoque-nanoblading.jpg", order: 0 } });
    }

    return NextResponse.json({ ok: true, design: !!design, nano: !!nano, retoque: !!retoque });
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
