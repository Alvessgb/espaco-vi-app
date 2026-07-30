import { NextRequest, NextResponse } from "next/server";
import { filtrarSlotsDisponiveis } from "@/lib/scheduling";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");
  const duration = parseInt(searchParams.get("duration") ?? "60");

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return NextResponse.json({ error: "invalid date" }, { status: 400 });

  const session = await auth();
  // @ts-expect-error role
  const isAdmin = session?.user?.role === "ADMIN";

  const excludeId = searchParams.get("excludeId") ?? undefined;
  const slots = await filtrarSlotsDisponiveis(d, duration, excludeId, isAdmin);
  return NextResponse.json({ slots });
}
