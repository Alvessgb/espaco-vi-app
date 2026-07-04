import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ date?: string; time?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { date, time } = await searchParams;
  if (!date || !time) redirect("/agendar");

  const session = await auth();
  let currentUser: { name: string | null; email: string; phone: string | null; birthDate: Date | null } | null = null;

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, birthDate: true },
    });
    if (user) currentUser = user;
  }

  return <CheckoutClient date={date} time={time} currentUser={currentUser} />;
}
