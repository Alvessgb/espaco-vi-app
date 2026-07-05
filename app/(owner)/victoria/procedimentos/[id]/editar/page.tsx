import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProcedureForm } from "../../procedure-form";
import { RemoveProcedureButton } from "./remove-button";

export default async function EditarProcedimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;

  const [procedure, categories] = await Promise.all([
    db.procedure.findUnique({ where: { id }, include: { images: { orderBy: { order: "asc" } } } }),
    db.procedureCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!procedure) notFound();

  // Check for future appointments
  const futureAppts = await db.appointmentProcedure.count({
    where: {
      procedureId: id,
      appointment: {
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
        startTime: { gte: new Date() },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="bg-[#3D2B1F] px-4 pt-5 pb-4 flex items-center gap-3 mb-4">
        <a href="/victoria/procedimentos" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">‹</a>
        <div>
          <h1 className="text-white font-bold text-base">Editar procedimento</h1>
          <p className="text-white/60 text-xs">Área da Victoria · Edição</p>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4">

      <ProcedureForm
        categories={categories}
        initialData={{
          id: procedure.id,
          categoryId: procedure.categoryId,
          name: procedure.name,
          slug: procedure.slug,
          shortDescription: procedure.shortDescription ?? undefined,
          description: procedure.description ?? undefined,
          priceInCents: procedure.priceInCents,
          durationMinutes: procedure.durationMinutes,
          badge: procedure.badge ?? undefined,
          indicatedFor: procedure.indicatedFor ?? undefined,
          expectedResult: procedure.expectedResult ?? undefined,
          beforeCare: procedure.beforeCare ?? undefined,
          afterCare: procedure.afterCare ?? undefined,
          internalNotes: procedure.internalNotes ?? undefined,
          imageUrl: procedure.images.find(i => i.isPrimary)?.url ?? procedure.images[0]?.url ?? undefined,
        }}
      />

      <div className="mt-4 pb-8">
        <RemoveProcedureButton id={procedure.id} hasFutureAppointments={futureAppts > 0} />
      </div>
      </div>
    </main>
  );
}
