import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LeaveRole } from '../types/leave.types'
import { useLeaveRequests } from '../hooks/useLeaveRequests'
import { useAuth } from '../../../../hooks/useAuth'
import { useStore } from '../../../../store/projectStore'
import { LeaveStatsBar } from '../components/LeaveStatsBar'
import { LeaveCard } from '../components/LeaveCard'
import { EmptyLeaveState } from '../components/EmptyLeaveState'
import { LeaveRequestForm } from '../components/LeaveRequestForm'
import { LeaveDetailsModal } from '../components/LeaveDetailsModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

interface MyLeavesPageProps {
  employeeId: string
  employeeName: string
  role: LeaveRole
}

export const MyLeavesPage = ({ employeeId, employeeName, role }: MyLeavesPageProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewLeaveId, setViewLeaveId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const { data: leaves, isLoading, error, refetch } = useLeaveRequests(employeeId)
  const { submitLeave, isSubmitting } = useLeaveActions()
  const { user } = useAuth()
  const { state: projectState } = useStore()

  const handleSubmitLeave = useCallback(async (data: any) => {
    // Dynamically find the manager from the projects where the user is a member
    const userProjects = projectState.projects.filter(p => 
      (p.members || []).some(m => m.id === employeeId)
    );
    
    // Use the managers from the user profile (can be multiple)
    const profileManagerIds = (user as any)?.managerIds || [];
    
    // Also include project managers if found
    const projectManagerIds = userProjects.map(p => p.managerId).filter(Boolean);
    
    // Combine and deduplicate
    const allManagerIds = Array.from(new Set([...profileManagerIds, ...projectManagerIds]));

    await submitLeave({
      ...data,
      employeeId,
      employeeName,
      managerId: allManagerIds[0] || null, // Primary for legacy support
      managerIds: allManagerIds,
    })
    setIsFormOpen(false)
    refetch()
  }, [submitLeave, employeeId, employeeName, user?.managerId, projectState.projects, refetch])

  const handleView = useCallback((id: string) => {
    setViewLeaveId(id)
  }, [])

  const filteredLeaves = leaves.filter(leave => {
    switch (activeTab) {
      case 'pending':
        return leave.status === 'PENDING' || leave.status === 'CHEF_APPROVED'
      case 'history':
        return leave.status !== 'PENDING' && leave.status !== 'CHEF_APPROVED'
      default:
        return true
    }
  })

  const leaveToView = leaves.find(leave => leave.id === viewLeaveId)

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
        <h1 className="text-2xl font-semibold text-gray-900">Mes Congés</h1>
        {role === 'EMPLOYEE' && (
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle demande
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Nouvelle demande de congé</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <LeaveRequestForm
                  employeeId={employeeId}
                  employeeName={employeeName}
                  onSubmit={handleSubmitLeave}
                  isSubmitting={isSubmitting}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {!isLoading && leaves.length > 0 && (
        <LeaveStatsBar leaves={leaves} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
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
            ) : filteredLeaves.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyLeaveState 
                  role={role} 
                  onRequestLeave={() => setIsFormOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredLeaves.map((leave, index) => (
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
      </Tabs>

      <LeaveDetailsModal
        leave={leaveToView || null}
        isOpen={!!viewLeaveId}
        onClose={() => setViewLeaveId(null)}
        role={role}
      />
    </div>
  )
}
