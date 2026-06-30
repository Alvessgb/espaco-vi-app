import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContaClient } from "./conta-client";
import { ContaLoginClient } from "./conta-login-client";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ContaPage({ searchParams }: Props) {
  const session = await auth();
  const { tab } = await searchParams;

  if (!session?.user?.id) {
    return <ContaLoginClient defaultTab={tab === "criar" ? "criar" : "login"} />;
  }

  // Admin → direct to Victoria area
  // @ts-expect-error role
  if (session.user?.role === "ADMIN") {
    redirect("/victoria/agenda/dia");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, birthDate: true },
  });

  if (!user) {
    return <ContaLoginClient defaultTab="login" />;
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
