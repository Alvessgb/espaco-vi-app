import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ContaClient } from "./conta-client";
import { BottomNav } from "@/components/ds/bottom-nav";

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
    <>
    <main className="min-h-screen bg-[#F5EBE0] pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-[#3D2B1F] mb-6 font-poppins">Minha conta</h1>
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
      </div>
    </main>
    <BottomNav />
    </>
  );
}
