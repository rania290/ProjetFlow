import { useState, useEffect, useCallback } from 'react'
import type { LeaveRequest } from '../types/leave.types'
import { leaveApi } from '../api/leave.api'

export type LeaveMode = 'OWNER' | 'MANAGER' | 'ALL'

export const useLeaveRequests = (id?: string, mode: LeaveMode = 'OWNER') => {
  const [data, setData] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaves = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let leaves: LeaveRequest[] = []

      if (mode === 'OWNER' && id) {
        leaves = await leaveApi.getMyLeaves(id)
      } else if (mode === 'MANAGER') {
        leaves = await leaveApi.getPendingLeaves(id)
      } else {
        leaves = await leaveApi.getLeaves()
      }

      setData(leaves)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [id, mode])

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  return {
    data,
    isLoading,
    error,
    refetch: fetchLeaves,
  }
}
