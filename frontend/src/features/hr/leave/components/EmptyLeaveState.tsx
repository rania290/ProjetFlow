import { motion } from 'framer-motion'
import type { LeaveRole } from '../types/leave.types'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface EmptyLeaveStateProps {
  role: LeaveRole
  onRequestLeave?: () => void
}

export const EmptyLeaveState = ({ role, onRequestLeave }: EmptyLeaveStateProps) => {
  const getSubtitle = () => {
    switch (role) {
      case 'EMPLOYEE':
        return 'Vous n\'avez pas encore soumis de demande'
      case 'MANAGER':
        return 'Aucune demande en attente de validation'
      case 'HR_ADMIN':
        return 'Aucune demande de congé à traiter'
      default:
        return 'Aucune demande de congé trouvée'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm"
    >
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
        <FileText className="w-10 h-10 text-indigo-500" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Aucune demande de congé
      </h3>

      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
        {getSubtitle()}
      </p>
    </motion.div>
  )
}
