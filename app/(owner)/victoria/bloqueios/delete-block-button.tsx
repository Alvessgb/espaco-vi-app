"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteScheduleBlock } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";

export function DeleteBlockButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteScheduleBlock(id);
      toast.success("Bloqueio removido");
      router.refresh();
    } catch {
      toast.error("Erro ao remover bloqueio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 font-poppins disabled:opacity-50 mt-0.5"
    >
      {loading ? "..." : "Remover"}
    </button>
  );
}
