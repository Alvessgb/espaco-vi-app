"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cancelAppointment } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    try {
      await cancelAppointment(appointmentId);
      toast.success("Agendamento cancelado");
      router.push("/meus-agendamentos");
    } catch {
      toast.error("Erro ao cancelar agendamento");
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
        Cancelar agendamento
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-poppins font-semibold text-[#3D2B1F] text-base mb-2">
              Cancelar agendamento?
            </h3>
            <p className="font-poppins text-sm text-[#8B6B5A] mb-5">
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 text-white rounded-full py-2.5 text-sm font-poppins font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Cancelando..." : "Cancelar agendamento"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-2.5 text-sm font-poppins font-medium hover:bg-[#F5EBE0] transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
