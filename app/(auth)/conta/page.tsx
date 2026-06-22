import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { ContaClient } from "./conta-client";
import { ContaLoginClient } from "./conta-login-client";

export default async function ContaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <ContaLoginClient />;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, birthDate: true },
  });

  if (!user) {
    return <ContaLoginClient />;
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/procedimentos" });
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
