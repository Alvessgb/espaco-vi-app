import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { DeleteBlockButton } from "./delete-block-button";

const reasonLabels: Record<string, string> = {
  DAY_OFF: "Folga",
  PERSONAL_COMMITMENT: "Compromisso pessoal",
  COURSE: "Curso",
  SPACE_MAINTENANCE: "Manutenção do espaço",
  RESERVED_TIME: "Horário reservado",
  OTHER: "Outro",
};

export default async function BloqueiosPage() {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const blocks = await db.scheduleBlock.findMany({
    where: { endTime: { gte: now } },
    orderBy: { startTime: "asc" },
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl">Bloqueios</h1>
        <Link
          href="/victoria/bloqueios/novo"
          className="text-sm bg-[#5F4B3C] text-white rounded-full px-4 py-2 font-poppins hover:bg-[#4a3a2d] transition-colors"
        >
          + Novo bloqueio
        </Link>
      </div>

      {blocks.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-poppins text-[#8B6B5A]">Nenhum bloqueio futuro.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((b) => {
            const date = b.startTime.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeRange =
              b.type === "FULL_DAY"
                ? "Dia inteiro"
                : `${b.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – ${b.endTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

            return (
              <div key={b.id} className="bg-white rounded-2xl border border-[#E0C5AC] p-4 shadow-sm flex items-start justify-between gap-3">
                <div>
                  <p className="font-poppins font-medium text-[#3D2B1F] text-sm capitalize">{date}</p>
                  <p className="font-poppins text-sm text-[#8B6B5A]">{timeRange}</p>
                  <p className="font-poppins text-xs text-[#5F4B3C] mt-1">{reasonLabels[b.reason] ?? b.reason}</p>
                  {b.note && <p className="font-poppins text-xs text-[#8B6B5A] mt-0.5 italic">{b.note}</p>}
                </div>
                <DeleteBlockButton id={b.id} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
