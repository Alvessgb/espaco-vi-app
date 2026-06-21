import * as React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, type AppointmentStatus } from "./status-badge";
import { Button } from "./button";

export interface AppointmentCardProps {
  id: string;
  date: string; // formatted date string, e.g. "21 de junho de 2026"
  time: string; // e.g. "10:00"
  services: string[];
  durationMinutes: number;
  totalPrice: number; // in cents
  status: AppointmentStatus;
  onCancel?: () => void;
  className?: string;
}

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

function AppointmentCard({
  date,
  time,
  services,
  durationMinutes,
  totalPrice,
  status,
  onCancel,
  className,
}: AppointmentCardProps) {
  const isCancellable = status === "PENDING_PAYMENT" || status === "CONFIRMED";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E0C5AC] p-5 flex flex-col gap-3 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-poppins text-sm text-[#5F4B3C]">
            <Calendar size={14} className="text-[#8B6B5A]" />
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 font-poppins text-sm text-[#8B6B5A]">
            <Clock size={14} />
            <span>{time}</span>
            <span>·</span>
            <span>{formatDuration(durationMinutes)}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Services */}
      <ul className="flex flex-col gap-0.5">
        {services.map((s, i) => (
          <li key={i} className="font-poppins text-sm text-[#5F4B3C] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#E0C5AC] inline-block" />
            {s}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#F5EBE0]">
        <span className="font-poppins font-semibold text-[#5F4B3C] text-sm">
          {formatPrice(totalPrice)}
        </span>
        {onCancel && isCancellable && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

export { AppointmentCard };
