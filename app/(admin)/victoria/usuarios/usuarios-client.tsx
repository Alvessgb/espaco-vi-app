"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { UserRow } from "./user-row";

type SortKey = "createdAt_desc" | "createdAt_asc" | "name_asc" | "name_desc";

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

export function UsuariosClient({ users }: { users: UserData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt_desc");

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "createdAt_desc", label: "Cadastro mais recente" },
    { value: "createdAt_asc",  label: "Cadastro mais antigo" },
    { value: "name_asc",       label: "Nome A→Z" },
    { value: "name_desc",      label: "Nome Z→A" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? users.filter(u =>
          (u.name ?? "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").includes(q) ||
          (u.birthDate ?? "").includes(q)
        )
      : [...users];

    list.sort((a, b) => {
      if (sort === "createdAt_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "createdAt_asc")  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "name_asc")  return (a.name ?? a.email).localeCompare(b.name ?? b.email, "pt-BR");
      if (sort === "name_desc") return (b.name ?? b.email).localeCompare(a.name ?? a.email, "pt-BR");
      return 0;
    });

    return list;
  }, [users, query, sort]);

  return (
    <main className="px-4 pt-5 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-bold text-[#3D2B1F] text-lg">Usuários</h1>
          <p className="text-xs text-[#8B6B5A] mt-0.5">
            {filtered.length} de {users.length} conta{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E0C5AC] rounded-xl px-3 py-2.5">
          <Search size={14} strokeWidth={1.5} className="text-[#8B6B5A] shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail, telefone..."
            className="flex-1 text-sm text-[#3D2B1F] outline-none bg-transparent placeholder:text-[#C4A080]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#8B6B5A]">
              <X size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#E0C5AC] rounded-xl px-3 py-2.5 shrink-0">
          <ArrowUpDown size={13} strokeWidth={1.5} className="text-[#8B6B5A]" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="text-xs text-[#5F4B3C] outline-none bg-transparent font-medium cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0C5AC] p-8 text-center">
          <p className="text-sm text-[#8B6B5A]">
            {query ? `Nenhum usuário encontrado para "${query}"` : "Nenhum usuário cadastrado."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(u => <UserRow key={u.id} user={u} />)}
        </div>
      )}
    </main>
  );
}
