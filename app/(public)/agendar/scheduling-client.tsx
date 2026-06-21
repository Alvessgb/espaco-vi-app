"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSlotsForDate } from "@/lib/scheduling-actions";
import { getCartDuration } from "@/lib/cart";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
  const [noSlots, setNoSlots] = useState(false);

  useEffect(() => {
    setDuration(getCartDuration() || 60);
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
    // Skip past dates and Sundays
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

  return (
    <div className="flex flex-col gap-5">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-[#F5EBE0] text-[#5F4B3C] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-[#3D2B1F]">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-[#F5EBE0] text-[#5F4B3C] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-[#8B6B5A] py-1">
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
                  mx-auto w-9 h-9 rounded-full text-sm transition-colors
                  ${isSelected ? "bg-[#5F4B3C] text-white" : ""}
                  ${!isSelected && isToday ? "border border-[#5F4B3C] text-[#5F4B3C]" : ""}
                  ${!isSelected && !isToday && !disabled ? "text-[#3D2B1F] hover:bg-[#F5EBE0]" : ""}
                  ${disabled ? "text-[#C4A080] cursor-not-allowed" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#3D2B1F] mb-3">
            Horários disponíveis
          </h2>
          {isPending ? (
            <p className="text-sm text-[#8B6B5A] text-center py-4">
              Verificando horários...
            </p>
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
                    py-2 rounded-xl text-xs font-medium transition-colors
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

      {/* CTA */}
      {selectedDate && selectedSlot && (
        <button
          onClick={handleConfirm}
          className="w-full bg-[#5F4B3C] text-white rounded-full py-3 text-sm font-medium hover:bg-[#4a3a2d] transition-colors"
        >
          Confirmar data e horário
        </button>
      )}
    </div>
  );
}
