import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NovoBlockForm } from "./novo-block-form";

export default async function NovoBloqueioPage() {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <a href="/victoria/bloqueios" className="text-sm text-[#8B6B5A] font-poppins mb-4 inline-block hover:text-[#5F4B3C]">
        ← Bloqueios
      </a>
      <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl mb-5">Novo bloqueio</h1>
      <p className="font-poppins text-sm text-[#8B6B5A] mb-5">
        Esse período não aparecerá como disponível para as clientes.
      </p>
      <NovoBlockForm />
    </main>
  );
}
