import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-[#E0C5AC]">
          {icon}
        </div>
      )}
      <h3 className="font-poppins font-semibold text-[#5F4B3C] text-lg mb-1">
        {title}
      </h3>
      {description && (
        <p className="font-poppins text-sm text-[#8B6B5A] max-w-xs mb-5">
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
