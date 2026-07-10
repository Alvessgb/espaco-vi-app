"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
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

  if (isPending) {
    return (
      <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
        <Loader2 size={13} strokeWidth={2} className="animate-spin text-red-400" />
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E0C5AC]">
        <span className="text-[11px] text-[#8B6B5A] flex-1">Remover bloqueio?</span>
        <button
          onClick={handleConfirm}
          className="text-[11px] font-bold text-red-600 px-3 py-1 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
        >
          Remover
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] text-[#8B6B5A] px-3 py-1 rounded-full border border-[#E0C5AC] hover:bg-[#F5EBE0] transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Desbloquear horário"
      className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
    >
      <Trash2 size={13} strokeWidth={2} />
    </button>
  );
}
