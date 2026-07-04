import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UsuariosClient } from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/conta");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birthDate: true,
      role: true,
      createdAt: true,
      password: true,
      _count: { select: { appointments: true } },
    },
  });

  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    birthDate: u.birthDate ? u.birthDate.toISOString().split("T")[0] : null,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    hasPassword: !!u.password,
    appointmentCount: u._count.appointments,
  }));

  return <UsuariosClient users={data} />;
}
