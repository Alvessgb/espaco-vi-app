import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

interface Props {
  searchParams: Promise<{ date?: string; time?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/checkout");

  const { date, time } = await searchParams;
  if (!date || !time) redirect("/agendar");

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-[#3D2B1F]">
            Confirmar agendamento
          </h1>
          <p className="text-sm text-[#8B6B5A] mt-0.5">
            Revise suas informações antes de continuar.
          </p>
        </div>

        <CheckoutClient
          date={date}
          time={time}
          user={{
            name: session.user?.name ?? "",
            email: session.user?.email ?? "",
            // @ts-expect-error — phone not in default session type
            phone: session.user?.phone ?? "",
          }}
        />
      </div>
    </main>
  );
}
