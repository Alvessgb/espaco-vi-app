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
      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${copied ? "bg-[#2D6A4F] text-white" : "bg-[#5F4B3C] text-white"}`}
    >
      {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
      {copied ? "Chave copiada!" : "Copiar chave Pix"}
    </button>
  );
}
