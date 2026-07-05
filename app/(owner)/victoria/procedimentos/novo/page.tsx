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
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="bg-[#3D2B1F] px-4 pt-5 pb-4 flex items-center gap-3 mb-4">
        <a href="/victoria/procedimentos" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">‹</a>
        <div>
          <h1 className="text-white font-bold text-base">Novo procedimento</h1>
          <p className="text-white/60 text-xs">Área da Victoria · Cadastro</p>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4">
        <ProcedureForm categories={categories} />
      </div>
    </main>
  );
}
