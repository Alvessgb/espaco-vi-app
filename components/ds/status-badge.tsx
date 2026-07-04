import * as React from "react";
import { cn } from "@/lib/utils";

export type AppointmentStatus =
  | "PENDING_PAYMENT"
  | "AWAITING_CONFIRMATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "NO_SHOW";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "Aguardando taxinha",
    className: "bg-[#F9A825]/20 text-[#E65100]",
  },
  AWAITING_CONFIRMATION: {
    label: "Aguardando confirmação",
    className: "bg-blue-50 text-blue-700",
  },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-[#4CAF50]/15 text-[#2E7D32]",
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-[#5F4B3C]/10 text-[#5F4B3C]",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-500",
  },
  RESCHEDULED: {
    label: "Reagendado",
    className: "bg-blue-50 text-blue-700",
  },
  NO_SHOW: {
    label: "Não compareceu",
    className: "bg-[#E53935]/10 text-[#C62828]",
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-poppins text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { StatusBadge };
