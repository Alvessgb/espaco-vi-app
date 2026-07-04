"use client";

import { useState } from "react";
import { markPaymentSent } from "@/lib/actions";

export function MarkPaymentButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await markPaymentSent(appointmentId);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-xs text-blue-600 font-medium text-center py-2">
        Pagamento enviado — aguardando confirmação da Victoria.
      </p>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full mt-1 bg-[#5F4B3C] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#4a3a2d] transition-colors disabled:opacity-60"
    >
      {loading ? "Aguarde..." : "Já fiz o pagamento"}
    </button>
  );
}
