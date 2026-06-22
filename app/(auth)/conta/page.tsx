import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ContaClient } from "./conta-client";

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, birthDate: true },
  });
  if (!user) redirect("/login");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <ContaClient
      user={{
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : "",
      }}
      signOutAction={signOutAction}
    />
  );
}
