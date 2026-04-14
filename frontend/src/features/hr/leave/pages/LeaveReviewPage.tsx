import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { LeaveRequest } from '../types/leave.types'
import { leaveApi } from '../api/leave.api'
import { LeaveStatusBadge } from '../components/LeaveStatusBadge'
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS } from '../constants/leave.constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LeaveReviewPageProps {
  id: string
}

export const LeaveReviewPage = ({ id }: LeaveReviewPageProps) => {
  const [leave, setLeave] = useState<LeaveRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const data = await leaveApi.getLeaveById(id)
        setLeave(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeave()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const formatRelativeTime = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr/dashboard">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !leave) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Demande non trouvée'}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link to="/hr/dashboard" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Demande de congé
          </h1>
          <nav className="text-sm text-gray-500">
            RH &gt; Demandes &gt; {leave.employeeName}
          </nav>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{leave.employeeName}</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium border', LEAVE_TYPE_COLORS[leave.type])}>
                  {LEAVE_TYPE_LABELS[leave.type]}
                </span>
                <LeaveStatusBadge status={leave.status} />
              </div>
            </div>
            {leave.calendarSynced && (
              <div className="flex items-center gap-1 text-emerald-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Synchronisé</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Période</p>
                  <p className="text-sm text-gray-600">
                    Du {formatDate(leave.startDate)} au {formatDate(leave.endDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Durée</p>
                  <p className="text-sm text-gray-600">
                    {leave.durationDays} jour{leave.durationDays > 1 ? 's' : ''} ouvré{leave.durationDays > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">ID Employé</p>
                  <p className="text-sm text-gray-600">{leave.employeeId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Date de soumission</p>
                <p className="text-sm text-gray-600">{formatRelativeTime(leave.createdAt)}</p>
              </div>
              
              {leave.reviewedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Date de décision</p>
                  <p className="text-sm text-gray-600">{formatRelativeTime(leave.reviewedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {leave.motif && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Motif</p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="text-sm text-gray-700 italic">{leave.motif}</p>
              </div>
            </div>
          )}

          {leave.status === 'PENDING' && (
            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-900 mb-4">Décision</p>
              <div className="flex gap-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            </div>
          )}

          {(leave.status === 'APPROVED' || leave.status === 'REJECTED') && (
            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-900 mb-4">Historique</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${leave.status === 'APPROVED' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {leave.status === 'APPROVED' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      {leave.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'} par {leave.reviewedBy}
                    </p>
                    <p className="text-xs text-gray-500">
                      {leave.reviewedAt && formatRelativeTime(leave.reviewedAt)}
                    </p>
                    {leave.rejectionReason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Raison: {leave.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
