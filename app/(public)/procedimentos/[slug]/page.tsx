import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";

export const dynamic = "force-dynamic";

function formatPrice(cents: number | null) {
  if (cents === null) return "A confirmar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return "A confirmar";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProcedimentoDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!db) notFound();
  const procedure = await db.procedure.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });

  if (!procedure || procedure.status === "REMOVED") notFound();

  const primaryImage = procedure.images.find((i) => i.isPrimary) ?? procedure.images[0];
  const imageUrl = primaryImage?.url ?? `https://placehold.co/800x500/E0C5AC/5F4B3C?text=${encodeURIComponent(procedure.name)}`;

  const cartItem = {
    id: procedure.id,
    slug: procedure.slug,
    name: procedure.name,
    priceInCents: procedure.priceInCents,
    durationMinutes: procedure.durationMinutes,
    imageUrl: primaryImage?.url,
  };

  const collapseItems = [
    procedure.beforeCare && { key: "before", label: "Cuidados antes do procedimento", content: procedure.beforeCare },
    procedure.afterCare && { key: "after", label: "Cuidados após o procedimento", content: procedure.afterCare },
  ].filter(Boolean) as { key: string; label: string; content: string }[];

  return (
    <main className="min-h-screen bg-[#F5EBE0] pb-24">
      {/* Hero Image */}
      <div className="relative w-full" style={{ height: "55vh", minHeight: 320 }}>
        <Image
          src={imageUrl}
          alt={procedure.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          unoptimized={imageUrl.includes("placehold.co")}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back button */}
        <Link
          href="/procedimentos"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#3D2B1F] shadow-sm"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>

        {/* Cart button */}
        <Link
          href="/carrinho"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#3D2B1F] shadow-sm"
        >
          <ShoppingBag size={18} strokeWidth={1.5} />
        </Link>

        {/* Badge bottom-left */}
        {procedure.badge && (
          <span className="absolute bottom-16 left-4 bg-[#E0C5AC] text-[#5F4B3C] text-xs font-medium px-3 py-1 rounded-full">
            {procedure.badge}
          </span>
        )}

        {/* Procedure name */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-2xl font-bold leading-tight drop-shadow-sm">
            {procedure.name}
          </h1>
        </div>
      </div>

      {/* Content card overlapping image */}
      <div className="bg-[#F5EBE0] rounded-t-3xl -mt-4 relative z-10">
        <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-5">
          {/* Price + Duration + Stars row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#E0C5AC] text-[#5F4B3C] font-bold px-4 py-1.5 rounded-full text-sm">
              {formatPrice(procedure.priceInCents)}
            </span>
            <span className="border border-[#E0C5AC] text-[#5F4B3C] px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
              <Clock size={12} strokeWidth={1.5} />
              {formatDuration(procedure.durationMinutes)}
            </span>
          </div>

          {/* About section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#3D2B1F] mb-2">Sobre o procedimento</h2>
            {procedure.description ? (
              <p className="text-sm text-[#5F4B3C] leading-relaxed">{procedure.description}</p>
            ) : (
              <p className="text-sm text-[#8B6B5A]">Informações em breve.</p>
            )}
          </div>

          {/* Collapsible care sections */}
          {collapseItems.length > 0 && (
            <div className="flex flex-col gap-3">
              {collapseItems.map((item) => (
                <details key={item.key} className="bg-white rounded-2xl shadow-sm group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <span className="font-bold text-[#3D2B1F] text-sm">{item.label}</span>
                    <svg
                      className="w-4 h-4 text-[#8B6B5A] transition-transform group-open:rotate-180"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-[#5F4B3C] leading-relaxed whitespace-pre-line">
                    {item.content}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E0C5AC] px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-3">
          <AddToCartButton item={cartItem} variant="outline" />
          <Link
            href="/carrinho"
            className="flex-1 bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-medium flex items-center justify-center hover:bg-[#4a3a2d] transition-colors"
          >
            Agendar agora
          </Link>
        </div>
      </div>
    </main>
  );
}
