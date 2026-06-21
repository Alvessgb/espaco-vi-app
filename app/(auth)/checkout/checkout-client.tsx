"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, type CartItem } from "@/lib/cart";
import { Clock, Calendar, User } from "lucide-react";

const BOOKING_FEE_CENTS = 3000;

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  date: string;
  time: string;
  user: { name: string; email: string; phone: string };
}

export function CheckoutClient({ date, time, user }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(getCart());
  }, []);

  const totalProcedures = items.reduce((s, i) => s + i.priceInCents, 0);
  const totalDuration = items.reduce((s, i) => s + i.durationMinutes, 0);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          procedures: items.map((i) => ({
            id: i.id,
            name: i.name,
            priceInCents: i.priceInCents,
            durationMinutes: i.durationMinutes,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erro ao criar sessão");
      }

      const { url } = (await res.json()) as { url: string };
      router.push(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    router.replace("/procedimentos");
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Services list */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#5F4B3C] mb-3">
          Procedimentos
        </h2>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between text-sm border-b border-[#F5EBE0] last:border-0 pb-2 last:pb-0"
            >
              <span className="text-[#3D2B1F]">{item.name}</span>
              <span className="text-[#8B6B5A]">
                {formatPrice(item.priceInCents)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Date & time */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm text-[#5F4B3C]">
          <Calendar size={16} className="shrink-0" />
          <span className="capitalize">{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#5F4B3C]">
          <Clock size={16} className="shrink-0" />
          <span>
            {time} · {formatDuration(totalDuration)}
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-[#8B6B5A]" />
          <h2 className="text-sm font-semibold text-[#5F4B3C]">Seus dados</h2>
        </div>
        <div className="flex flex-col gap-1 text-sm text-[#8B6B5A]">
          {user.name && <p>{user.name}</p>}
          <p>{user.email}</p>
          {user.phone && <p>{user.phone}</p>}
        </div>
      </div>

      {/* Price summary */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-[#8B6B5A]">
          <span>Valor dos procedimentos</span>
          <span>{formatPrice(totalProcedures)}</span>
        </div>
        <div className="flex justify-between font-medium text-[#5F4B3C] border-t border-[#F5EBE0] pt-2 mt-1">
          <span>Taxa de agendamento</span>
          <span>{formatPrice(BOOKING_FEE_CENTS)}</span>
        </div>
        <p className="text-xs text-[#8B6B5A] bg-[#F5EBE0] rounded-xl p-3 mt-1">
          A taxa de R$30 confirma seu horário e será abatida no valor final.
        </p>
      </div>

      {error && (
        <p className="text-sm text-[#E53935] text-center">{error}</p>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#4a3a2d] transition-colors disabled:opacity-60"
      >
        {loading ? "Aguarde..." : "Confirmar e pagar R$30"}
      </button>
    </div>
  );
}
