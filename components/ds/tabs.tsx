"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn("flex border-b border-[#E0C5AC] gap-0", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "px-4 py-2.5 font-poppins text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F4B3C]",
              isActive
                ? "text-[#5F4B3C] border-b-2 border-[#5F4B3C] -mb-px"
                : "text-[#8B6B5A] hover:text-[#5F4B3C]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };
