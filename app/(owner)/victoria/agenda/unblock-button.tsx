"use client";

import { useState, useTransition } from "react";
import { deleteScheduleBlock } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";

export function UnblockButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      await deleteScheduleBlock(id);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="flex-1 bg-red-600 text-white rounded-full py-1.5 text-xs font-bold disabled:opacity-50"
        >
          {isPending ? "Removendo…" : "Sim, desbloquear"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 border border-red-200 text-red-600 rounded-full py-1.5 text-xs font-medium"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-2"
    >
      Desbloquear horário
    </button>
  );
}
