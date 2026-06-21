import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-poppins text-xs font-medium",
  {
    variants: {
      variant: {
        category: "bg-[#E0C5AC] text-[#5F4B3C]",
        success: "bg-[#4CAF50]/15 text-[#2E7D32]",
        error: "bg-[#E53935]/15 text-[#C62828]",
        warning: "bg-[#F9A825]/20 text-[#E65100]",
        price: "bg-[#5F4B3C] text-white",
        neutral: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "category",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
