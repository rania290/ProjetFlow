import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
}

export function Calendar({ className, selected, onSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay() - 1
    return day === -1 ? 6 : day // Monday as first day
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i)

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const isSelected = (day: number) => {
    return selected?.getDate() === day && 
           selected?.getMonth() === month && 
           selected?.getFullYear() === year
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }

  return (
    <div className={cn("p-3 bg-white rounded-2xl shadow-xl border border-slate-100 w-[280px]", className)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-xs font-black uppercase tracking-widest text-slate-900">
          {months[month]} {year}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["L", "M", "M", "J", "V", "S", "D"].map(d => (
          <div key={d} className="text-[10px] font-bold text-slate-400 text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map(i => <div key={`empty-${i}`} />)}
        {days.map(day => (
          <button
            key={day}
            onClick={() => onSelect?.(new Date(year, month, day))}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all",
              isSelected(day) 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : isToday(day)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}
