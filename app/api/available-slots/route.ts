import { NextRequest, NextResponse } from "next/server";
import { filtrarSlotsDisponiveis } from "@/lib/scheduling";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");
  const duration = parseInt(searchParams.get("duration") ?? "60");

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return NextResponse.json({ error: "invalid date" }, { status: 400 });

  const slots = await filtrarSlotsDisponiveis(d, duration);
  return NextResponse.json({ slots });
}
