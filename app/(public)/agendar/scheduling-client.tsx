"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSlotsForDate } from "@/lib/scheduling-actions";
import { getCart, getCartDuration } from "@/lib/cart";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

interface Slot {
  time: string;
  available: boolean;
}

export function SchedulingClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [cartCount, setCartCount] = useState(0);
  const [noSlots, setNoSlots] = useState(false);

  useEffect(() => {
    setDuration(getCartDuration() || 60);
    setCartCount(getCart().length);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  function handleDayClick(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    if (date < todayStart || date.getDay() === 0) return;

    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);
    setNoSlots(false);

    startTransition(async () => {
      const result = await getSlotsForDate(toDateStr(date), duration);
      setSlots(result);
      setNoSlots(result.every((s) => !s.available));
    });
  }

  function handleConfirm() {
    if (!selectedDate || !selectedSlot) return;
    const params = new URLSearchParams({
      date: toDateStr(selectedDate),
      time: selectedSlot,
    });
    router.push(`/checkout?${params.toString()}`);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const canConfirm = selectedDate !== null && selectedSlot !== null;

  return (
    <main className="min-h-screen bg-[#F5EBE0] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#5F4B3C] px-4 py-3 flex items-center">
        <Link href="/carrinho" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 text-center mx-3">
          <p className="text-white font-bold text-base leading-tight">Data e horário</p>
          <p className="text-white/70 text-xs leading-tight flex items-center justify-center gap-1">
            <Clock size={11} /> Duração total: {formatDuration(duration)}
          </p>
        </div>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Info banner */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <span className="text-2xl">📅</span>
          <p className="text-sm text-[#3D2B1F]">
            <strong>{cartCount} {cartCount === 1 ? "procedimento" : "procedimentos"}</strong> · {formatDuration(duration)} · Ter a Sáb · 9h às 19h
          </p>
        </div>

        {/* Calendar card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5EBE0] text-[#5F4B3C] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-[#3D2B1F]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5EBE0] text-[#5F4B3C] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs text-[#8B6B5A] py-1 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isPast = date < todayStart;
              const isSunday = date.getDay() === 0;
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === viewMonth &&
                selectedDate?.getFullYear() === viewYear;
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              const disabled = isPast || isSunday;

              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={`
                    mx-auto w-9 h-9 rounded-full text-sm transition-colors font-medium
                    ${isSelected ? "bg-[#5F4B3C] text-white" : ""}
                    ${!isSelected && isToday ? "bg-[#5F4B3C] text-white" : ""}
                    ${!isSelected && !isToday && !disabled ? "text-[#3D2B1F] hover:bg-[#F5EBE0]" : ""}
                    ${disabled ? "text-[#C4A080] cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#3D2B1F] mb-1">Horários disponíveis</h2>
            <p className="text-xs text-[#8B6B5A] mb-3">
              {DAYS[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
            </p>
            {isPending ? (
              <p className="text-sm text-[#8B6B5A] text-center py-4">Verificando horários...</p>
            ) : noSlots ? (
              <p className="text-sm text-[#8B6B5A] text-center py-4">
                Não há horários disponíveis nesse dia.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`
                      py-2.5 rounded-xl text-xs font-medium transition-colors
                      ${selectedSlot === slot.time ? "bg-[#5F4B3C] text-white" : ""}
                      ${slot.available && selectedSlot !== slot.time ? "bg-[#F5EBE0] text-[#5F4B3C] hover:bg-[#EDD9C5]" : ""}
                      ${!slot.available ? "bg-[#F5EBE0] text-[#C4A080] cursor-not-allowed line-through" : ""}
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E0C5AC] px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`w-full rounded-full py-3.5 text-sm font-semibold transition-colors ${
              canConfirm
                ? "bg-[#5F4B3C] text-white hover:bg-[#4a3a2d]"
                : "bg-[#E0C5AC] text-[#5F4B3C] cursor-not-allowed"
            }`}
          >
            Selecionar data e horário
          </button>
        </div>
      </div>
    </main>
  );
}
