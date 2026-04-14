import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LeaveRequest, LeaveType } from '../types/leave.types'
import { LEAVE_TYPE_COLORS } from '../constants/leave.constants'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaveCalendarViewProps {
  leaves: LeaveRequest[]
}

export const LeaveCalendarView = ({ leaves }: LeaveCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getLeavesForDay = (day: Date) => {
    return leaves.filter(leave => {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      return day >= start && day <= end && leave.status === 'APPROVED'
    })
  }

  const getPendingLeavesForDay = (day: Date) => {
    return leaves.filter(leave => {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      return day >= start && day <= end && leave.status === 'PENDING'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthYear = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const days = getMonthDays(currentDate)
  const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

  return (
    <TooltipProvider>
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800 capitalize">
            {monthYear}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5 w-full">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 w-full">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-8 w-full" />
            }

            const approvedLeaves = getLeavesForDay(day)
            const pendingLeaves = getPendingLeavesForDay(day)
            const hasLeaves = approvedLeaves.length > 0 || pendingLeaves.length > 0
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <Tooltip key={day.toISOString()}>
                <TooltipTrigger
                  render={
                    <div
                      className={cn(
                        'h-8 w-full flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-colors',
                        isToday ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        hasLeaves && !isToday && 'bg-slate-50 ring-1 ring-slate-200'
                      )}
                    />
                  }
                >
                  <span>{day.getDate()}</span>
                  {hasLeaves && (
                    <div className="absolute top-1 right-1 flex gap-0.5">
                      {approvedLeaves.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm" />
                      )}
                      {pendingLeaves.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-sm" />
                      )}
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent className="bg-white border-slate-200 text-slate-800 shadow-xl">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{day.toLocaleDateString('fr-FR')}</p>
                    {approvedLeaves.map(leave => (
                      <div key={leave.id} className="text-xs">
                        <span className="text-slate-700 font-bold">{leave.employeeName}</span> — <span className="text-emerald-600 font-bold text-[10px] uppercase">{leave.type}</span>
                      </div>
                    ))}
                    {pendingLeaves.map(leave => (
                      <div key={leave.id} className="text-xs">
                        <span className="text-slate-700 font-bold">{leave.employeeName}</span> — <span className="text-amber-600 font-bold text-[10px] uppercase">{leave.type} (ATT)</span>
                      </div>
                    ))}
                    {!hasLeaves && <p className="text-xs text-slate-400 italic">Aucune absence</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <div className="flex justify-center items-center gap-4 mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-full">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm" />
            <span>Approuvé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm" />
            <span>En attente</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
