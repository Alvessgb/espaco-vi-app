"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-white border border-[#E0C5AC] shadow-xl p-6 mx-4",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8B6B5A] hover:text-[#5F4B3C] transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        {title && (
          <h2 id="modal-title" className="font-poppins font-semibold text-lg text-[#5F4B3C] mb-1 pr-6">
            {title}
          </h2>
        )}
        {description && (
          <p id="modal-desc" className="font-poppins text-sm text-[#8B6B5A] mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export { Modal };
