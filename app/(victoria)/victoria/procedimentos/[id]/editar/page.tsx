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
    <main className="max-w-lg mx-auto px-4 py-6">
      <a href="/victoria/procedimentos" className="text-sm text-[#8B6B5A] font-poppins mb-4 inline-block hover:text-[#5F4B3C]">
        ← Procedimentos
      </a>
      <h1 className="font-poppins font-semibold text-[#3D2B1F] text-xl mb-5">Editar procedimento</h1>

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

      <div className="mt-4">
        <RemoveProcedureButton id={procedure.id} hasFutureAppointments={futureAppts > 0} />
      </div>
    </main>
  );
}
