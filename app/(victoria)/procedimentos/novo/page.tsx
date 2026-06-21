import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProcedureForm } from "../procedure-form";

export default async function NovoProcedimentoPage() {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const categories = await db.procedureCategory.findMany({ orderBy: { order: "asc" } });

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <a href="/victoria/procedimentos" className="text-sm text-[#8B6B5A] font-poppins mb-4 inline-block hover:text-[#5F4B3C]">
        ← Procedimentos
      </a>
      <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl mb-5">Novo procedimento</h1>
      <ProcedureForm categories={categories} />
    </main>
  );
}
