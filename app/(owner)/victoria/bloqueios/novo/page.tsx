import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NovoBlockForm } from "./novo-block-form";

export default async function NovoBloqueioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; returnTo?: string }>;
}) {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const { date, returnTo } = await searchParams;

  return <NovoBlockForm initialDate={date ?? ""} returnTo={returnTo} />;
}
