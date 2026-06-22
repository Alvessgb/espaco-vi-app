import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NovoBlockForm } from "./novo-block-form";

export default async function NovoBloqueioPage() {
  const session = await auth();
  // @ts-expect-error — role
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  return <NovoBlockForm />;
}
