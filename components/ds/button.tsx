import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-poppins font-medium transition-all duration-150 rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F4B3C] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-[#5F4B3C] text-white hover:bg-[#4e3c30] active:bg-[#3d2e24]",
        secondary: "bg-[#E0C5AC] text-[#5F4B3C] hover:bg-[#d4b69c] active:bg-[#c9a78c]",
        ghost: "bg-transparent text-[#5F4B3C] border border-[#5F4B3C] hover:bg-[#5F4B3C]/5 active:bg-[#5F4B3C]/10",
        danger: "bg-[#E53935] text-white hover:bg-[#c62828] active:bg-[#b71c1c]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
