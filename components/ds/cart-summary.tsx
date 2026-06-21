"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface CartItem {
  id: string;
  name: string;
  price: number; // in cents
  durationMinutes: number;
}

export interface CartSummaryProps {
  items: CartItem[];
  onRemove?: (id: string) => void;
  onCheckout?: () => void;
  onClear?: () => void;
  className?: string;
}

const BOOKING_FEE_CENTS = 3000; // R$30

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

function CartSummary({ items, onRemove, onCheckout, onClear, className }: CartSummaryProps) {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = items.reduce((sum, item) => sum + item.durationMinutes, 0);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E0C5AC] p-5 flex flex-col gap-4 shadow-sm",
        className
      )}
    >
      <h2 className="font-poppins font-semibold text-[#5F4B3C] text-base">
        Resumo do agendamento
      </h2>

      {items.length === 0 ? (
        <p className="font-poppins text-sm text-[#8B6B5A] text-center py-4">
          Nenhum procedimento selecionado
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-[#F5EBE0] last:border-0"
            >
              <div className="flex flex-col">
                <span className="font-poppins text-sm font-medium text-[#5F4B3C]">
                  {item.name}
                </span>
                <span className="font-poppins text-xs text-[#8B6B5A]">
                  {formatDuration(item.durationMinutes)} · {formatPrice(item.price)}
                </span>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-[#8B6B5A] hover:text-[#E53935] transition-colors p-1"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <>
          <div className="flex flex-col gap-1.5 text-sm font-poppins">
            <div className="flex justify-between text-[#8B6B5A]">
              <span>Duração total</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex justify-between text-[#8B6B5A]">
              <span>Valor dos procedimentos</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-medium text-[#5F4B3C] pt-1 border-t border-[#F5EBE0]">
              <span>Taxa de agendamento</span>
              <span>{formatPrice(BOOKING_FEE_CENTS)}</span>
            </div>
          </div>

          <p className="font-poppins text-xs text-[#8B6B5A] bg-[#F5EBE0] rounded-xl p-3">
            A taxa de R$30 confirma seu horário e será abatida no valor final.
          </p>

          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" className="w-full" onClick={onCheckout}>
              Confirmar e pagar R$30
            </Button>
            {onClear && (
              <Button variant="ghost" size="sm" className="w-full" onClick={onClear}>
                Limpar seleção
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { CartSummary };
