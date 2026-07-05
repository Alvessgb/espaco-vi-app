"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setProcedureStatus } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";

export function RemoveProcedureButton({
  id,
  hasFutureAppointments,
}: {
  id: string;
  hasFutureAppointments: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(action: "REMOVED" | "UNAVAILABLE") {
    setLoading(true);
    try {
      await setProcedureStatus(id, action);
      toast.success(action === "REMOVED" ? "Procedimento removido" : "Procedimento marcado como indisponível");
      router.push("/victoria/procedimentos");
    } catch {
      toast.error("Erro ao atualizar procedimento");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full border border-red-300 text-red-600 rounded-full py-2.5 text-sm font-poppins font-medium hover:bg-red-50 transition-colors"
      >
        Remover procedimento
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-poppins font-semibold text-[#3D2B1F] text-base mb-2">
              Remover procedimento?
            </h3>
            <p className="font-poppins text-sm text-[#8B6B5A] mb-3">
              Esse procedimento deixará de aparecer no catálogo para novas clientes. Essa ação não altera agendamentos já confirmados.
            </p>
            {hasFutureAppointments && (
              <div className="bg-[#F9A825]/10 border border-[#F9A825]/30 rounded-xl p-3 mb-4">
                <p className="font-poppins text-xs text-[#E65100]">
                  Esse procedimento possui agendamentos futuros. Você pode torná-lo indisponível para novos agendamentos sem afetar os horários já confirmados.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handle("REMOVED")}
                disabled={loading}
                className="w-full bg-red-600 text-white rounded-full py-2.5 text-sm font-poppins font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Remover
              </button>
              {hasFutureAppointments && (
                <button
                  onClick={() => handle("UNAVAILABLE")}
                  disabled={loading}
                  className="w-full border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-2.5 text-sm font-poppins font-medium hover:bg-[#F5EBE0] disabled:opacity-50 transition-colors"
                >
                  Tornar indisponível
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="w-full border border-gray-200 text-gray-500 rounded-full py-2.5 text-sm font-poppins font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
