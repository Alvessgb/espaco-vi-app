"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shrink-0 transition-colors ${copied ? "bg-[#2D6A4F] text-white" : "bg-[#5F4B3C] text-white"}`}
    >
      {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}
