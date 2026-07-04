import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AgendamentosClient } from "./agendamentos-client";

export const dynamic = "force-dynamic";

export default async function AgendamentosPage() {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/conta");

  const appointments = await db.appointment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      procedures: { select: { name: true, priceInCents: true } },
      payment: { select: { status: true, paidAt: true } },
    },
  });

  const data = appointments.map(appt => ({
    id: appt.id,
    status: appt.status as string,
    notes: appt.notes,
    startTime: appt.startTime.toISOString(),
    durationMinutes: appt.durationMinutes,
    totalPriceInCents: appt.totalPriceInCents,
    user: appt.user,
    procedures: appt.procedures,
    paymentStatus: appt.payment?.status ?? null,
    paidAt: appt.payment?.paidAt?.toISOString() ?? null,
    createdAt: appt.createdAt.toISOString(),
  }));

  return <AgendamentosClient appointments={data} />;
}
