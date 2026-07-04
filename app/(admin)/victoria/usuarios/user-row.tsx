"use client";

import { useState, useTransition } from "react";
import { User, Phone, Calendar, ChevronDown, ChevronUp, Trash2, KeyRound, Edit3, Check, X } from "lucide-react";
import { updateUser, resetUserPassword, deleteUser } from "@/lib/admin-actions";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  birthDate: string | null;
  role: string;
  createdAt: string;
  hasPassword: boolean;
  appointmentCount: number;
}

export function UserRow({ user }: { user: UserData }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [resettingPwd, setResettingPwd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    birthDate: user.birthDate ?? "",
  });
  const [newPwd, setNewPwd] = useState("");

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateUser(user.id, form);
      if (res.error) flash(res.error, false);
      else { flash("Dados atualizados.", true); setEditing(false); }
    });
  }

  function handlePwd() {
    startTransition(async () => {
      const res = await resetUserPassword(user.id, newPwd);
      if (res.error) flash(res.error, false);
      else { flash("Senha redefinida.", true); setResettingPwd(false); setNewPwd(""); }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteUser(user.id);
      if (res.error) flash(res.error, false);
      else flash("Usuário removido.", true);
    });
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isAdmin ? "border-[#5F4B3C]" : "border-[#E0C5AC]"}`}>
      {/* Summary row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-[#3D2B1F]" : "bg-[#E0C5AC]"}`}>
          <User size={18} strokeWidth={1.5} className={isAdmin ? "text-white" : "text-[#5F4B3C]"} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-[#3D2B1F] text-sm truncate">{user.name ?? "Sem nome"}</p>
            {isAdmin && <span className="text-[10px] font-bold bg-[#3D2B1F] text-white px-2 py-0.5 rounded-full shrink-0">ADMIN</span>}
          </div>
          <p className="text-xs text-[#8B6B5A] truncate">{user.email}</p>
          <p className="text-xs text-[#C4A080] mt-0.5">Cadastrado em {user.createdAt} · {user.appointmentCount} agendamento{user.appointmentCount !== 1 ? "s" : ""}</p>
        </div>
        {open ? <ChevronUp size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0" /> : <ChevronDown size={16} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0" />}
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-[#F5EBE0] px-4 pb-4 pt-3 flex flex-col gap-4">

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            {user.phone && (
              <span className="flex items-center gap-1 text-xs text-[#5F4B3C] bg-[#F5EBE0] px-3 py-1.5 rounded-full">
                <Phone size={11} strokeWidth={1.5} />{user.phone}
              </span>
            )}
            {user.birthDate && (
              <span className="flex items-center gap-1 text-xs text-[#5F4B3C] bg-[#F5EBE0] px-3 py-1.5 rounded-full">
                <Calendar size={11} strokeWidth={1.5} />{new Date(user.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[#5F4B3C] bg-[#F5EBE0] px-3 py-1.5 rounded-full">
              {user.hasPassword ? "🔑 Senha cadastrada" : "🔗 Login social"}
            </span>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="flex flex-col gap-2 bg-[#F5EBE0] rounded-xl p-3">
              <p className="text-xs font-bold text-[#3D2B1F] mb-1">Editar dados</p>
              {[
                { label: "Nome", key: "name" as const, type: "text" },
                { label: "E-mail", key: "email" as const, type: "email" },
                { label: "Telefone", key: "phone" as const, type: "tel" },
                { label: "Data de nascimento", key: "birthDate" as const, type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-[#8B6B5A] font-medium uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-white border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C] mt-0.5"
                  />
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button onClick={handleSave} disabled={isPending} className="flex-1 bg-[#3D2B1F] text-white rounded-full py-2 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                  <Check size={13} strokeWidth={2} />Salvar
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 border border-[#E0C5AC] text-[#8B6B5A] rounded-full py-2 text-xs font-medium flex items-center justify-center gap-1">
                  <X size={13} strokeWidth={2} />Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Reset password form */}
          {resettingPwd && (
            <div className="flex flex-col gap-2 bg-[#F5EBE0] rounded-xl p-3">
              <p className="text-xs font-bold text-[#3D2B1F] mb-1">Nova senha</p>
              <input
                type="text"
                placeholder="Digite a nova senha..."
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="w-full bg-white border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm text-[#3D2B1F] outline-none focus:border-[#5F4B3C]"
              />
              <div className="flex gap-2 mt-1">
                <button onClick={handlePwd} disabled={isPending || !newPwd} className="flex-1 bg-[#3D2B1F] text-white rounded-full py-2 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                  <Check size={13} strokeWidth={2} />Redefinir
                </button>
                <button onClick={() => { setResettingPwd(false); setNewPwd(""); }} className="flex-1 border border-[#E0C5AC] text-[#8B6B5A] rounded-full py-2 text-xs font-medium flex items-center justify-center gap-1">
                  <X size={13} strokeWidth={2} />Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-xs font-bold text-red-700">Apagar usuário? Todos os agendamentos serão cancelados.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={isPending} className="flex-1 bg-red-600 text-white rounded-full py-2 text-xs font-bold disabled:opacity-50">
                  Confirmar exclusão
                </button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-red-200 text-red-600 rounded-full py-2 text-xs font-medium">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!editing && !resettingPwd && !confirmDelete && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#F5EBE0] text-[#5F4B3C] rounded-full text-xs font-medium hover:bg-[#E0C5AC] transition-colors">
                <Edit3 size={13} strokeWidth={1.5} />Editar dados
              </button>
              <button onClick={() => setResettingPwd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#F5EBE0] text-[#5F4B3C] rounded-full text-xs font-medium hover:bg-[#E0C5AC] transition-colors">
                <KeyRound size={13} strokeWidth={1.5} />Redefinir senha
              </button>
              {!isAdmin && (
                <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-medium hover:bg-red-100 transition-colors">
                  <Trash2 size={13} strokeWidth={1.5} />Apagar
                </button>
              )}
            </div>
          )}

          {/* Flash message */}
          {msg && (
            <p className={`text-xs font-medium px-3 py-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
