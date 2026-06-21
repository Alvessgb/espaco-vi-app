import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
}

function Chip({ active = false, label, className, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 font-poppins text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F4B3C]",
        active
          ? "bg-[#5F4B3C] text-white"
          : "bg-[#E0C5AC] text-[#5F4B3C] hover:bg-[#d4b69c]",
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}

export { Chip };
