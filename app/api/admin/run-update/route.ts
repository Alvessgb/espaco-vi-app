import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SECRET = "vi2025check";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const blonde = await db.procedure.findUnique({ where: { slug: "blonde-brows" }, include: { images: true } });
  const design = await db.procedure.findUnique({ where: { slug: "design-com-coloracao" }, include: { images: true } });
  const nano = await db.procedure.findUnique({ where: { slug: "nanoblading" }, include: { images: true } });
  const retoque = await db.procedure.findUnique({ where: { slug: "retoque-nanoblading" }, include: { images: true } });
  return NextResponse.json({ blonde: blonde ? { id: blonde.id, status: blonde.status, images: blonde.images } : null, design: design?.images, nano: nano?.images, retoque: retoque?.images });
}
