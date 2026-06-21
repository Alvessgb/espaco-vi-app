import * as React from "react";
import { cn } from "@/lib/utils";

export type SlotState = "available" | "selected" | "unavailable";

export interface CalendarSlotProps {
  time: string; // e.g. "09:00" or "09:00 - 10:30"
  state?: SlotState;
  onClick?: () => void;
  className?: string;
}

function CalendarSlot({
  time,
  state = "available",
  onClick,
  className,
}: CalendarSlotProps) {
  const isDisabled = state === "unavailable";

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-selected={state === "selected"}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-3 py-2 font-poppins text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F4B3C]",
        state === "available" &&
          "bg-[#E0C5AC] text-[#5F4B3C] hover:bg-[#d4b69c] cursor-pointer",
        state === "selected" &&
          "bg-[#5F4B3C] text-white cursor-pointer",
        state === "unavailable" &&
          "bg-gray-100 text-gray-400 cursor-not-allowed line-through",
        className
      )}
    >
      {time}
    </button>
  );
}

export { CalendarSlot };
