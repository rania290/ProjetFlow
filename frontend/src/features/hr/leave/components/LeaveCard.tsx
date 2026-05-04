import { motion } from 'framer-motion'
import type { LeaveRequest, LeaveRole } from '../types/leave.types'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS } from '../constants/leave.constants'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaveCardProps {
  leave: LeaveRequest
  role: LeaveRole
  onReview?: (id: string) => void
  onView?: (id: string) => void
  index?: number
}

export const LeaveCard = ({ leave, role, onReview, onView, index = 0 }: LeaveCardProps) => {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getBorderColor = () => {
    switch (leave.status) {
      case 'PENDING': return 'border-l-amber-400'
      case 'CHEF_APPROVED': return 'border-l-blue-400'
      case 'FULLY_APPROVED': return 'border-l-emerald-400'
      case 'REJECTED': return 'border-l-red-400'
      default: return 'border-l-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        onClick={() => onView?.(leave.id)}
        className={cn(
          'p-5 transition-all duration-200 border-l-4 rounded-2xl bg-white border-y border-r border-slate-100 shadow-sm hover:shadow-md cursor-pointer',
          getBorderColor()
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-slate-200">
              <AvatarFallback className="bg-amber-50 text-amber-800 text-sm font-bold">
                {getInitials(leave.employeeName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-slate-800">{leave.employeeName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', LEAVE_TYPE_COLORS[leave.type])}>
                  {LEAVE_TYPE_LABELS[leave.type]}
                </span>
                <LeaveStatusBadge status={leave.status} size="sm" />
              </div>
            </div>
          </div>
          {leave.calendarSynced && (
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <RefreshCw className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sync</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {leave.motif && (
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{leave.motif}</p>
          )}

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>Du {formatDate(leave.startDate)} au {formatDate(leave.endDate)}</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">{leave.durationDays} jour{leave.durationDays > 1 ? 's' : ''} ouvré{leave.durationDays > 1 ? 's' : ''}</span>
          </div>
        </div>


      </Card>
    </motion.div>
  )
}
