import { motion } from 'framer-motion'
import { useState } from 'react'
import type { LeaveRequest } from '../types/leave.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface ReviewModalProps {
  leave: LeaveRequest | null
  open: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  isReviewing: boolean
}

export const ReviewModal = ({ leave, open, onClose, onApprove, onReject, isReviewing }: ReviewModalProps) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  if (!leave) return null

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const handleApprove = () => {
    onApprove(leave.id)
    onClose()
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) return
    onReject(leave.id, rejectionReason)
    onClose()
    setShowRejectionForm(false)
    setRejectionReason('')
  }

  const handleRejectClick = () => {
    setShowRejectionForm(true)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Demande de congé - {leave.employeeName}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <p className="text-gray-600">{leave.type}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Durée:</span>
                <p className="text-gray-600">{leave.durationDays} jour{leave.durationDays > 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Du:</span>
                <p className="text-gray-600">{formatDate(leave.startDate)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Au:</span>
                <p className="text-gray-600">{formatDate(leave.endDate)}</p>
              </div>
            </div>

            {leave.motif && (
              <div className="mt-3 pt-3 border-t">
                <span className="font-medium text-gray-700">Motif:</span>
                <blockquote className="mt-1 pl-3 border-l-2 border-gray-300 italic text-gray-600">
                  {leave.motif}
                </blockquote>
              </div>
            )}
          </div>

          {!showRejectionForm ? (
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isReviewing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isReviewing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approuver
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={isReviewing}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                {isReviewing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Rejeter
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Label htmlFor="rejectionReason" className="text-sm font-medium">
                Raison du rejet (obligatoire)
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Veuillez expliquer la raison du rejet..."
                className="min-h-[100px]"
                maxLength={500}
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isReviewing}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isReviewing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirmer le rejet
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectionForm(false)
                    setRejectionReason('')
                  }}
                  variant="outline"
                  disabled={isReviewing}
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
