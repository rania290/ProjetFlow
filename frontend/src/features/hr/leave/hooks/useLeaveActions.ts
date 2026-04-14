import { useState } from 'react'
import { toast } from 'sonner'
import type { CreateLeaveDto, ReviewLeaveDto } from '../types/leave.types'
import { leaveApi } from '../api/leave.api'

export const useLeaveActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const submitLeave = async (dto: CreateLeaveDto, onSuccess?: () => void) => {
    try {
      setIsSubmitting(true)
      await leaveApi.createLeave(dto)
      toast.success('Demande de congé soumise avec succès')
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de la soumission';
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  }

  const approveLeave = async (id: string, reviewedBy: string, onSuccess?: () => void) => {
    try {
      setIsReviewing(true)
      await leaveApi.reviewLeave(id, { status: 'APPROVED', reviewedBy })
      toast.success('Demande approuvée avec succès')
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'approbation';
      toast.error(message);
    } finally {
      setIsReviewing(false)
    }
  }

  const rejectLeave = async (id: string, reviewedBy: string, rejectionReason: string, onSuccess?: () => void) => {
    try {
      setIsReviewing(true)
      await leaveApi.reviewLeave(id, { status: 'REJECTED', reviewedBy, rejectionReason })
      toast.success('Demande rejetée avec succès')
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors du rejet';
      toast.error(message);
    } finally {
      setIsReviewing(false)
    }
  }

  const deleteLeave = async (id: string, onSuccess?: () => void) => {
    try {
      setIsDeleting(true)
      await leaveApi.deleteLeave(id)
      toast.success('Demande annulée avec succès')
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'annulation';
      toast.error(message);
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    isSubmitting,
    isReviewing,
    isDeleting,
    submitLeave,
    approveLeave,
    rejectLeave,
    deleteLeave,
  }
}
