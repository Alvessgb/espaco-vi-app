import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EditBlockForm } from "./edit-block-form";

export default async function EditarBloqueioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  // @ts-expect-error role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const block = await db.scheduleBlock.findUnique({ where: { id } });
  if (!block) notFound();

  const dateStr = block.startTime.toISOString().split("T")[0];
  const startTimeStr = block.type === "TIME_RANGE"
    ? `${String(block.startTime.getHours()).padStart(2, "0")}:${String(block.startTime.getMinutes()).padStart(2, "0")}`
    : "";
  const endTimeStr = block.type === "TIME_RANGE"
    ? `${String(block.endTime.getHours()).padStart(2, "0")}:${String(block.endTime.getMinutes()).padStart(2, "0")}`
    : "";

  return (
    <EditBlockForm
      id={block.id}
      initialDate={dateStr}
      initialStartTime={startTimeStr}
      initialEndTime={endTimeStr}
      initialAllDay={block.type === "FULL_DAY"}
      initialReason={block.reason}
      initialNote={block.note ?? ""}
    />
  );
}
