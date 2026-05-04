import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LeaveRole, LeaveRequest } from '../types/leave.types'
import { useLeaveRequests } from '../hooks/useLeaveRequests'
import { useLeaveActions } from '../hooks/useLeaveActions'
import { LeaveStatsBar } from '../components/LeaveStatsBar'
import { LeaveCard } from '../components/LeaveCard'
import { EmptyLeaveState } from '../components/EmptyLeaveState'
import { LeaveCalendarView } from '../components/LeaveCalendarView'
import { LeaveDetailsModal } from '../components/LeaveDetailsModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS } from '../constants/leave.constants'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface HRDashboardPageProps {
  role: LeaveRole
}

export const HRDashboardPage = ({ role }: HRDashboardPageProps) => {
  const [viewLeaveId, setViewLeaveId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: allLeaves, isLoading, error, refetch } = useLeaveRequests()
  const { approveLeave, rejectLeave, isReviewing } = useLeaveActions()

  const handleApprove = useCallback(async (id: string) => {
    await approveLeave(id, 'current-user')
    setViewLeaveId(null)
    refetch()
  }, [approveLeave, refetch])

  const handleReject = useCallback(async (id: string, reason: string) => {
    await rejectLeave(id, 'current-user', reason)
    setViewLeaveId(null)
    refetch()
  }, [rejectLeave, refetch])

  const handleView = useCallback((id: string) => {
    setViewLeaveId(id)
  }, [])

  const getFilteredLeaves = () => {
    return allLeaves.filter(leave => {
      if (activeTab === 'pending' && leave.status !== 'PENDING') return false
      if (statusFilter !== 'all' && leave.status !== statusFilter) return false
      if (typeFilter !== 'all' && leave.type !== typeFilter) return false
      return true
    })
  }

  const getRecentActivity = () => {
    return allLeaves
      .filter(leave => leave.reviewedAt)
      .sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime())
      .slice(0, 5)
  }

  const getLeaveTypeStats = () => {
    const stats: Record<string, number> = {}
    allLeaves.forEach(leave => {
      stats[leave.type] = (stats[leave.type] || 0) + 1
    })
    return Object.entries(stats).map(([type, count]) => ({
      type: type as any,
      count,
      percentage: Math.round((count / allLeaves.length) * 100),
    }))
  }

  const leaveToView = allLeaves.find(leave => leave.id === viewLeaveId)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord RH</h1>
      </div>

      {!isLoading && allLeaves.length > 0 && (
        <LeaveStatsBar leaves={allLeaves} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </motion.div>
                ) : allLeaves.filter(l => l.status === 'PENDING').length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyLeaveState role={role} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {allLeaves
                      .filter(leave => leave.status === 'PENDING')
                      .map((leave, index) => (
                        <LeaveCard
                          key={leave.id}
                          leave={leave}
                          role={role}
                          onView={handleView}
                        />
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="flex gap-4 mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="PENDING">En attente Chef</SelectItem>
                    <SelectItem value="CHEF_APPROVED">Validé Chef</SelectItem>
                    <SelectItem value="FULLY_APPROVED">Approuvés</SelectItem>
                    <SelectItem value="REJECTED">Rejetés</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {getFilteredLeaves().map((leave, index) => (
                  <LeaveCard
                    key={leave.id}
                    leave={leave}
                    role={role}
                    onView={handleView}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <LeaveCalendarView leaves={allLeaves} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecentActivity().map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.status === 'FULLY_APPROVED' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : activity.status === 'CHEF_APPROVED' ? (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.employeeName} - {
                        activity.status === 'FULLY_APPROVED' ? 'Approuvé' : 
                        activity.status === 'CHEF_APPROVED' ? 'Validé par Chef' : 'Rejeté'
                      }
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.reviewedAt && formatDistanceToNow(new Date(activity.reviewedAt), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résumé par type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getLeaveTypeStats().map(({ type, count, percentage }) => (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={LEAVE_TYPE_COLORS[type].split(' ')[1]}>
                        {LEAVE_TYPE_LABELS[type]}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LeaveDetailsModal
        leave={leaveToView || null}
        isOpen={!!viewLeaveId}
        onClose={() => setViewLeaveId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isReviewing={isReviewing}
      />
    </div>
  )
}
