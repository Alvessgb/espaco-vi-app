import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ date?: string; time?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { date, time } = await searchParams;
  if (!date || !time) redirect("/agendar");

  return <CheckoutClient date={date} time={time} />;
}
