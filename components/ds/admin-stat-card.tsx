import * as React from "react";
import { cn } from "@/lib/utils";

export interface AdminStatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

function AdminStatCard({ icon, label, value, trend, className }: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E0C5AC] p-5 flex flex-col gap-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-poppins text-sm text-[#8B6B5A]">{label}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#F5EBE0] flex items-center justify-center text-[#5F4B3C]">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-poppins font-bold text-2xl text-[#5F4B3C]">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "font-poppins text-xs font-medium mb-0.5",
              trend.positive ? "text-[#4CAF50]" : "text-[#E53935]"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

export { AdminStatCard };
