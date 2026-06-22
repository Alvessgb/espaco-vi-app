"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createProcedure, updateProcedure } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Info, ImageIcon, AlignLeft, Sparkles, Tag } from "lucide-react";

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

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 }, { label: "45 min", value: 45 },
  { label: "1h", value: 60 }, { label: "1h 15min", value: 75 },
  { label: "1h 30min", value: 90 }, { label: "1h 45min", value: 105 },
  { label: "2h", value: 120 }, { label: "2h 30min", value: 150 },
  { label: "3h", value: 180 },
];

const BADGE_OPTIONS = ["Mais pedido", "Novidade", "Promoção", "Exclusivo", "Recomendado"];

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E0C5AC] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F5EBE0]">
        <span className="w-8 h-8 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#5F4B3C]">{icon}</span>
        <span className="font-bold text-[#3D2B1F] text-sm">{title}</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children, optional }: { label: string; required?: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[#8B6B5A] font-medium">
          {label} {required && <span className="text-[#3D2B1F]">*</span>}
        </label>
        {optional && <span className="text-[10px] text-[#C4A080]">opcional</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-[#E0C5AC] rounded-xl px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#C4A080] outline-none focus:border-[#5F4B3C] bg-white";

export function ProcedureForm({ categories, initialData }: Props) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? "");
  const [name, setName]             = useState(initialData?.name ?? "");
  const [slug, setSlug]             = useState(initialData?.slug ?? "");
  const [price, setPrice]           = useState(initialData?.priceInCents != null ? String(initialData.priceInCents / 100) : "");
  const [duration, setDuration]     = useState(initialData?.durationMinutes != null ? String(initialData.durationMinutes) : "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [description, setDescription]           = useState(initialData?.description ?? "");
  const [indicatedFor, setIndicatedFor]   = useState(initialData?.indicatedFor ?? "");
  const [beforeCare, setBeforeCare] = useState(initialData?.beforeCare ?? "");
  const [afterCare, setAfterCare]   = useState(initialData?.afterCare ?? "");
  const [badge, setBadge]           = useState(initialData?.badge ?? "");
  const [internalNotes, setInternalNotes] = useState(initialData?.internalNotes ?? "");
  const [imageUrl, setImageUrl]     = useState(initialData?.imageUrl ?? "");
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading]       = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!initialData) setSlug(slugify(v));
  }

  function applyImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImageUrl(url);
    setImageInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceInCents    = price    ? Math.round(parseFloat(price) * 100) : null;
    const durationMinutes = duration ? parseInt(duration)                   : null;
    setLoading(true);
    try {
      const data = {
        categoryId, name, slug,
        shortDescription: shortDescription || undefined,
        description:      description      || undefined,
        priceInCents, durationMinutes,
        badge:         badge         || undefined,
        indicatedFor:  indicatedFor  || undefined,
        beforeCare:    beforeCare    || undefined,
        afterCare:     afterCare     || undefined,
        internalNotes: internalNotes || undefined,
        imageUrl:      imageUrl      || undefined,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-8">

      {/* 1. Informações principais */}
      <Section icon={<Info size={16} strokeWidth={1.5} />} title="Informações principais">
        <Field label="Nome do procedimento" required>
          <input value={name} onChange={e => handleNameChange(e.target.value)} required
            placeholder="Ex: Fox Glow, Brow Lamination..." className={inputCls} />
        </Field>
        <Field label="Categoria" required>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className={inputCls}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)" required>
            <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="Ex: 150,00" className={inputCls} />
          </Field>
          <Field label="Duração" required>
            <select value={duration} onChange={e => setDuration(e.target.value)} className={inputCls}>
              <option value="">Selecionar</option>
              {DURATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Slug (URL)" required>
          <input value={slug} onChange={e => setSlug(e.target.value)} required
            placeholder="ex: fox-glow" className={`${inputCls} text-[#8B6B5A]`} />
        </Field>
      </Section>

      {/* 2. Imagem */}
      <Section icon={<ImageIcon size={16} strokeWidth={1.5} />} title="Imagem do procedimento">
        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
            <button type="button" onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div
            className="w-full aspect-video rounded-xl border-2 border-dashed border-[#E0C5AC] flex flex-col items-center justify-center gap-2 bg-[#FDFAF7] cursor-pointer"
            onClick={() => document.getElementById("imageUrlInput")?.focus()}
          >
            <Upload size={24} strokeWidth={1.5} className="text-[#C4A080]" />
            <p className="text-sm text-[#C4A080] font-medium">Toque para adicionar foto</p>
            <p className="text-xs text-[#D4B49A]">Cole a URL da imagem abaixo</p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            id="imageUrlInput"
            value={imageInput}
            onChange={e => setImageInput(e.target.value)}
            placeholder="https://images.pexels.com/..."
            className="flex-1 border border-[#E0C5AC] rounded-xl px-3 py-2.5 text-xs text-[#3D2B1F] outline-none focus:border-[#5F4B3C]"
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyImage())}
          />
          <button type="button" onClick={applyImage}
            className="bg-[#5F4B3C] text-white rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-[#4a3a2d]">
            Usar
          </button>
        </div>
      </Section>

      {/* 3. Descrição e detalhes */}
      <Section icon={<AlignLeft size={16} strokeWidth={1.5} />} title="Descrição e detalhes">
        <Field label="Descrição curta" required>
          <input value={shortDescription} onChange={e => setShortDescription(e.target.value)}
            placeholder="Uma frase atrativa para o card (máx. 2 linhas)" className={inputCls} />
        </Field>
        <Field label="Descrição completa" required>
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Descrição detalhada para a tela de detalhes do procedimento"
            className={`${inputCls} resize-none`} />
        </Field>
        <Field label="Indicado para" optional>
          <textarea rows={2} value={indicatedFor} onChange={e => setIndicatedFor(e.target.value)}
            placeholder="Para quem é esse procedimento?" className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      {/* 4. Cuidados */}
      <Section icon={<Sparkles size={16} strokeWidth={1.5} />} title="Cuidados">
        <Field label="Cuidados antes do procedimento" optional>
          <textarea rows={3} value={beforeCare} onChange={e => setBeforeCare(e.target.value)}
            placeholder="Separe cada cuidado em uma linha" className={`${inputCls} resize-none`} />
        </Field>
        <Field label="Cuidados após o procedimento" optional>
          <textarea rows={3} value={afterCare} onChange={e => setAfterCare(e.target.value)}
            placeholder="Separe cada cuidado em uma linha" className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      {/* 5. Configurações */}
      <Section icon={<Tag size={16} strokeWidth={1.5} />} title="Configurações">
        <Field label="Badge" optional>
          <select value={badge} onChange={e => setBadge(e.target.value)} className={inputCls}>
            <option value="">Selecionar badge</option>
            {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Observações internas" optional>
          <textarea rows={2} value={internalNotes} onChange={e => setInternalNotes(e.target.value)}
            placeholder="Anotações visíveis apenas para você" className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      <p className="text-xs text-[#8B6B5A] text-center px-4">
        <Info size={11} strokeWidth={1.5} className="inline mr-1" />
        Campos marcados com * são obrigatórios para salvar o procedimento.
      </p>

      <button type="submit" disabled={loading}
        className="bg-[#3D2B1F] text-white rounded-full py-4 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? "Salvando..." : "✓  Salvar procedimento"}
      </button>

      <a href="/victoria/procedimentos"
        className="text-center text-sm text-[#8B6B5A] py-2">
        Cancelar
      </a>
    </form>
  );
}
