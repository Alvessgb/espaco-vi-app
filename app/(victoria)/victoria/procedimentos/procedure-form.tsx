"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createProcedure, updateProcedure } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";

interface Category { id: string; name: string; }
interface ProcedureData {
  id?: string; categoryId: string; name: string; slug: string;
  shortDescription?: string; description?: string;
  priceInCents: number | null; durationMinutes: number | null;
  badge?: string; indicatedFor?: string; expectedResult?: string;
  beforeCare?: string; afterCare?: string; internalNotes?: string;
  imageUrl?: string;
}
interface Props { categories: Category[]; initialData?: ProcedureData; }

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

export function ProcedureForm({ categories, initialData }: Props) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? "");
  const [name, setName]             = useState(initialData?.name ?? "");
  const [slug, setSlug]             = useState(initialData?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [description, setDescription]           = useState(initialData?.description ?? "");
  const [price, setPrice]           = useState(initialData?.priceInCents != null ? String(initialData.priceInCents / 100) : "");
  const [duration, setDuration]     = useState(initialData?.durationMinutes != null ? String(initialData.durationMinutes) : "");
  const [badge, setBadge]           = useState(initialData?.badge ?? "");
  const [indicatedFor, setIndicatedFor]   = useState(initialData?.indicatedFor ?? "");
  const [expectedResult, setExpectedResult] = useState(initialData?.expectedResult ?? "");
  const [beforeCare, setBeforeCare] = useState(initialData?.beforeCare ?? "");
  const [afterCare, setAfterCare]   = useState(initialData?.afterCare ?? "");
  const [internalNotes, setInternalNotes] = useState(initialData?.internalNotes ?? "");
  const [imageUrl, setImageUrl]     = useState(initialData?.imageUrl ?? "");
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading]       = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!initialData) setSlug(slugify(v));
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImageUrl(url);
    setImageInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceInCents    = price    ? Math.round(parseFloat(price) * 100)  : null;
    const durationMinutes = duration ? parseInt(duration)                    : null;

    setLoading(true);
    try {
      const data = {
        categoryId, name, slug,
        shortDescription: shortDescription || undefined,
        description:      description      || undefined,
        priceInCents,
        durationMinutes,
        badge:            badge            || undefined,
        indicatedFor:     indicatedFor     || undefined,
        expectedResult:   expectedResult   || undefined,
        beforeCare:       beforeCare       || undefined,
        afterCare:        afterCare        || undefined,
        internalNotes:    internalNotes    || undefined,
        imageUrl:         imageUrl         || undefined,
      };

      if (initialData?.id) {
        await updateProcedure(initialData.id, data);
        toast.success("Procedimento atualizado");
      } else {
        await createProcedure(data);
        toast.success("Procedimento criado");
      }
      router.push("/victoria/procedimentos");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm flex flex-col gap-4">

      {/* Image section */}
      <div>
        <span className="font-poppins text-xs text-[#8B6B5A] mb-2 block">Imagem do procedimento</span>
        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
            <Image src={imageUrl} alt="Imagem" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl border-2 border-dashed border-[#E0C5AC] flex items-center justify-center mb-2 bg-[#FDFAF7]">
            <div className="text-center text-[#C4A080]">
              <ImagePlus size={28} strokeWidth={1.5} className="mx-auto mb-1" />
              <p className="text-xs">Cole a URL da imagem abaixo</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={imageInput}
            onChange={e => setImageInput(e.target.value)}
            placeholder="https://images.pexels.com/..."
            className="flex-1 border border-[#E0C5AC] rounded-lg px-3 py-2 text-xs font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]"
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImage())}
          />
          <button type="button" onClick={addImage} className="bg-[#5F4B3C] text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-[#4a3a2d] transition-colors">
            Usar
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Categoria *</span>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins bg-white focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]">
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Nome *</span>
        <input value={name} onChange={e => handleNameChange(e.target.value)} required className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Slug *</span>
        <input value={slug} onChange={e => setSlug(e.target.value)} required className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-poppins text-xs text-[#8B6B5A]">Preço (R$)</span>
          <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-poppins text-xs text-[#8B6B5A]">Duração (min)</span>
          <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]" />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Descrição curta</span>
        <input value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Descrição completa</span>
        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C] resize-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-poppins text-xs text-[#8B6B5A]">Badge (ex: Mais pedido)</span>
        <input value={badge} onChange={e => setBadge(e.target.value)} className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C]" />
      </label>

      <details className="group">
        <summary className="font-poppins text-xs text-[#8B6B5A] cursor-pointer list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          Campos opcionais
        </summary>
        <div className="flex flex-col gap-3 mt-3">
          {[
            { label: "Indicado para", value: indicatedFor, set: setIndicatedFor },
            { label: "Resultado esperado", value: expectedResult, set: setExpectedResult },
            { label: "Cuidados pré-procedimento", value: beforeCare, set: setBeforeCare },
            { label: "Cuidados pós-procedimento", value: afterCare, set: setAfterCare },
            { label: "Notas internas", value: internalNotes, set: setInternalNotes },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex flex-col gap-1">
              <span className="font-poppins text-xs text-[#8B6B5A]">{label}</span>
              <textarea rows={2} value={value} onChange={e => set(e.target.value)} className="border border-[#E0C5AC] rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-[#5F4B3C] resize-none" />
            </label>
          ))}
        </div>
      </details>

      <button type="submit" disabled={loading} className="bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-poppins font-medium hover:bg-[#4a3a2d] transition-colors disabled:opacity-50">
        {loading ? "Salvando..." : "Salvar procedimento"}
      </button>
    </form>
  );
}
