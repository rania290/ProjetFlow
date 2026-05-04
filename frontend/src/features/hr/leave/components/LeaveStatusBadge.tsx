import type { LeaveStatus } from '../types/leave.types'
import { STATUS_CONFIG } from '../constants/leave.constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LeaveStatusBadgeProps {
  status: LeaveStatus
  size?: 'sm' | 'md'
}

export const LeaveStatusBadge = ({ status, size = 'md' }: LeaveStatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-slate-50 text-slate-400 border-slate-200',
    dotClass: 'bg-slate-300'
  }
  
  return (
    <Badge
      variant="outline"
      className={cn(
        config.badgeClass,
        'flex items-center gap-1.5 font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          config.dotClass
        )}
      />
      {config.label}
    </Badge>
  )
}
