import * as React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";

export interface ProcedureCardProps {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  price: number; // in cents
  durationMinutes: number;
  imageUrl?: string;
  badge?: string;
  isInCart?: boolean;
  onAdd: () => void;
  onViewDetails?: () => void;
  className?: string;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function ProcedureCard({
  name,
  shortDescription,
  price,
  durationMinutes,
  imageUrl,
  badge,
  isInCart = false,
  onAdd,
  onViewDetails,
  className,
}: ProcedureCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E0C5AC] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 bg-[#F5EBE0]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#E0C5AC]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge variant="price">{badge}</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-poppins font-semibold text-[#5F4B3C] text-base leading-tight">
          {name}
        </h3>
        {shortDescription && (
          <p className="font-poppins text-xs text-[#8B6B5A] line-clamp-2 flex-1">
            {shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="font-poppins font-semibold text-[#5F4B3C] text-sm">
            {formatPrice(price)}
          </span>
          <span className="inline-flex items-center gap-1 font-poppins text-xs text-[#8B6B5A]">
            <Clock size={12} />
            {formatDuration(durationMinutes)}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={onViewDetails}
            >
              Ver detalhes
            </Button>
          )}
          <Button
            variant={isInCart ? "secondary" : "primary"}
            size="sm"
            className="flex-1"
            onClick={onAdd}
          >
            {isInCart ? "Adicionado ✓" : "Adicionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ProcedureCard };
