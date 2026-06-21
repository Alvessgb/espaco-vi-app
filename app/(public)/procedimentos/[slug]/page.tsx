import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";

export const dynamic = "force-dynamic";

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

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProcedimentoDetailPage({ params }: Props) {
  const { slug } = await params;
  const procedure = await db.procedure.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });

  if (!procedure || procedure.status === "REMOVED") notFound();

  const primaryImage =
    procedure.images.find((i) => i.isPrimary) ?? procedure.images[0];

  const cartItem = {
    id: procedure.id,
    slug: procedure.slug,
    name: procedure.name,
    priceInCents: procedure.priceInCents,
    durationMinutes: procedure.durationMinutes,
    imageUrl: primaryImage?.url,
  };

  const sections = [
    { label: "Indicado para", content: procedure.indicatedFor },
    { label: "Resultado esperado", content: procedure.expectedResult },
    { label: "Cuidados antes", content: procedure.beforeCare },
    { label: "Cuidados após", content: procedure.afterCare },
  ].filter((s) => s.content);

  return (
    <main className="min-h-screen bg-[#F5EBE0]">
      {/* Back */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <Link
          href="/procedimentos"
          className="inline-flex items-center gap-1 text-sm text-[#8B6B5A] hover:text-[#5F4B3C] transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-5">
        {/* Image */}
        <div className="relative h-60 rounded-2xl overflow-hidden bg-[#EDD9C5]">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={procedure.name}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#E0C5AC]">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-[#8B6B5A]">{procedure.category.name}</p>
              <h1 className="text-xl font-semibold text-[#3D2B1F]">
                {procedure.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[#5F4B3C]">
              {formatPrice(procedure.priceInCents)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-[#8B6B5A]">
              <Clock size={14} />
              {formatDuration(procedure.durationMinutes)}
            </span>
          </div>

          {procedure.description && (
            <p className="text-sm text-[#5F4B3C] leading-relaxed">
              {procedure.description}
            </p>
          )}

          <AddToCartButton item={cartItem} />
        </div>

        {/* Sections */}
        {sections.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-[#5F4B3C] mb-2">
              {s.label}
            </h2>
            <p className="text-sm text-[#8B6B5A] leading-relaxed whitespace-pre-line">
              {s.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
