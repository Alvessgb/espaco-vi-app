import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-poppins text-sm font-medium text-[#5F4B3C]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-10 w-full rounded-xl border border-[#E0C5AC] bg-white px-3 py-2",
            "font-poppins text-sm text-[#5F4B3C] placeholder:text-[#B89A85]",
            "focus:outline-none focus:ring-2 focus:ring-[#5F4B3C] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[#E53935] focus:ring-[#E53935]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="font-poppins text-xs text-[#E53935]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
