import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';

interface DueDateMiniCalendarProps {
  value: number;
  onChange: (day: number) => void;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
}

export const DueDateMiniCalendar: React.FC<DueDateMiniCalendarProps> = ({
  value,
  onChange,
  label = 'Jatuh Tempo (Tgl)',
  className = '',
  min = 1,
  max = 28,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month navigation in mini calendar for visualization
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Days in selected month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const clampedDay = Math.min(Math.max(day, min), max);
    onChange(clampedDay);
    setIsOpen(false);
  };

  const quickPresets = [1, 5, 10, 15, 20, 25, 28];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-slate-300 font-semibold mb-1 text-xs flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-emerald-400 font-normal">
            Tgl {value} tiap bulan
          </span>
        </label>
      )}

      {/* Input Group with Mini Calendar Trigger */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="number"
            min={min}
            max={max}
            value={value || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) {
                onChange(Math.min(Math.max(val, min), max));
              }
            }}
            placeholder="1-28"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Buka Addon Kalender Mini"
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isOpen
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 hover:border-emerald-500/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Kalender</span>
        </button>
      </div>

      {/* Mini Calendar Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Pilihan Cepat Jatuh Tempo:
            </span>
            <div className="flex flex-wrap gap-1">
              {quickPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectDay(p)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    value === p
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-emerald-400'
                  }`}
                >
                  Tgl {p}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayNames.map((d, i) => (
              <span
                key={d}
                className={`text-[10px] font-bold ${
                  i === 0 ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value === day;
              const isOutOfLimit = day > max || day < min;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isOutOfLimit}
                  onClick={() => handleSelectDay(day)}
                  className={`h-6 text-[11px] rounded-lg font-medium transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : isOutOfLimit
                      ? 'text-slate-600 opacity-40 cursor-not-allowed'
                      : 'text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Tagihan terbit tgl <strong>{value}</strong> tiap bulan
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
