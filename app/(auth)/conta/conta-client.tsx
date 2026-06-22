"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions";
import { Pencil, User, Phone, Mail, Calendar, CalendarDays, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  user: { id: string; name: string; email: string; phone: string; birthDate: string; };
  signOutAction: () => Promise<void>;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("");
}

export function ContaClient({ user, signOutAction }: Props) {
  const [phone, setPhone]       = useState(user.phone);
  const [email, setEmail]       = useState(user.email);
  const [editPhone, setEditPhone] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [loading, setLoading]   = useState(false);

  const [firstName, ...rest] = user.name.split(" ");
  const lastName = rest.join(" ");

  const formattedBirth = user.birthDate
    ? new Date(user.birthDate + "T00:00:00").toLocaleDateString("pt-BR")
    : "—";

  async function save(field: "phone" | "email") {
    setLoading(true);
    try {
      await updateUserProfile({ name: user.name, phone: field === "phone" ? phone : user.phone });
      toast.success("Dados atualizados");
      if (field === "phone") setEditPhone(false);
      if (field === "email") setEditEmail(false);
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0]">
      {/* Brown header */}
      <header className="bg-[#5F4B3C] px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/procedimentos" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </Link>
          <h1 className="text-white font-bold text-lg">Minha conta</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#E0C5AC] flex items-center justify-center">
              <span className="text-[#5F4B3C] font-bold text-2xl">{getInitials(user.name)}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="text-[#5F4B3C] text-xs">📷</span>
            </button>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-base">{user.name}</p>
            <p className="text-white/70 text-sm">{user.email}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 flex flex-col gap-4">
        {/* Data card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <p className="font-bold text-[#3D2B1F] text-base">Seus dados</p>
            <p className="text-xs text-[#8B6B5A] mt-0.5">Revise as suas informações pessoais</p>
          </div>

          {/* Nome */}
          <DataRow icon={<User size={15} strokeWidth={1.5} />} label="Nome" value={firstName} />
          {/* Sobrenome */}
          <DataRow icon={<User size={15} strokeWidth={1.5} />} label="Sobrenome" value={lastName || "—"} />
          {/* Data nascimento */}
          <DataRow icon={<Calendar size={15} strokeWidth={1.5} />} label="Data de nascimento" value={formattedBirth} />

          {/* WhatsApp — editável */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-[#F5EBE0]">
            <span className="text-[#8B6B5A] shrink-0"><Phone size={15} strokeWidth={1.5} /></span>
            <div className="flex-1">
              <p className="text-xs text-[#8B6B5A]">WhatsApp</p>
              {editPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="flex-1 text-sm text-[#3D2B1F] border border-[#E0C5AC] rounded-lg px-2 py-1 outline-none focus:border-[#5F4B3C]"
                  />
                  <button onClick={() => save("phone")} disabled={loading} className="text-xs text-white bg-[#5F4B3C] rounded-lg px-3 py-1.5 font-medium">
                    {loading ? "..." : "Salvar"}
                  </button>
                  <button onClick={() => { setEditPhone(false); setPhone(user.phone); }} className="text-xs text-[#8B6B5A]">✕</button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#3D2B1F]">{phone || "—"}</p>
              )}
            </div>
            {!editPhone && (
              <button onClick={() => setEditPhone(true)} className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#8B6B5A]">
                <Pencil size={13} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* E-mail */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-[#F5EBE0]">
            <span className="text-[#8B6B5A] shrink-0"><Mail size={15} strokeWidth={1.5} /></span>
            <div className="flex-1">
              <p className="text-xs text-[#8B6B5A]">E-mail</p>
              <p className="text-sm font-semibold text-[#3D2B1F]">{user.email}</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#8B6B5A]">
              <Pencil size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Info note */}
        <div className="bg-[#EDD9C5] rounded-2xl px-4 py-3">
          <p className="text-xs text-[#5F4B3C] leading-relaxed">
            Nome, sobrenome e data de nascimento não podem ser alterados. Para ajustes, entre em contato pelo WhatsApp.
          </p>
        </div>

        {/* Appointments shortcut */}
        <Link href="/meus-agendamentos" className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#F5EBE0] flex items-center justify-center shrink-0">
            <CalendarDays size={18} strokeWidth={1.5} className="text-[#5F4B3C]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#3D2B1F] text-sm">Meus agendamentos</p>
            <p className="text-xs text-[#8B6B5A]">Ver próximos e histórico</p>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="text-[#8B6B5A]" />
        </Link>

        {/* Sign out */}
        <form action={signOutAction}>
          <button type="submit" className="w-full border border-[#E0C5AC] text-[#5F4B3C] rounded-full py-3.5 text-sm font-medium hover:bg-[#EDD9C5] transition-colors">
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  );
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-t border-[#F5EBE0]">
      <span className="text-[#8B6B5A] shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-[#8B6B5A]">{label}</p>
        <p className="text-sm font-semibold text-[#3D2B1F]">{value}</p>
      </div>
    </div>
  );
}
