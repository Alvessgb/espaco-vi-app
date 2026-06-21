"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions";

interface ContaClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
  };
  signOutAction: () => Promise<void>;
}

export function ContaClient({ user, signOutAction }: ContaClientProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await updateUserProfile({ name, phone, birthDate });
      toast.success("Dados atualizados com sucesso");
      setEditing(false);
    } catch {
      toast.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins font-semibold text-[#3D2B1F] text-base">Seus dados</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-[#5F4B3C] font-medium underline underline-offset-2 font-poppins"
            >
              Editar dados
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-poppins text-xs text-[#8B6B5A]">Nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-poppins text-xs text-[#8B6B5A]">Telefone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-poppins text-xs text-[#8B6B5A]">Data de nascimento</span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
              />
            </label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#5F4B3C] text-white rounded-full py-2.5 text-sm font-medium font-poppins hover:bg-[#4a3a2d] transition-colors disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-2.5 text-sm font-medium font-poppins hover:bg-[#F5EBE0] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Field label="Nome" value={user.name || "—"} />
            <Field label="E-mail" value={user.email} />
            <Field label="Telefone" value={user.phone || "—"} />
            <Field
              label="Data de nascimento"
              value={
                user.birthDate
                  ? new Date(user.birthDate + "T00:00:00").toLocaleDateString("pt-BR")
                  : "—"
              }
            />
          </div>
        )}
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-3 text-sm font-medium font-poppins hover:bg-[#F5EBE0] transition-colors"
        >
          Sair
        </button>
      </form>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-poppins text-xs text-[#8B6B5A] mb-0.5">{label}</p>
      <p className="font-poppins text-sm text-[#3D2B1F]">{value}</p>
    </div>
  );
}
