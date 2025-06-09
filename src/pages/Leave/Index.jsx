"use client"

// Components
import LeaveRequestTable from "@/components/leave/LeaveRequestTable"


export function LeaveRequestIndex() {
  return (
    <div className="space-y-6">
      <div className="animate-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Leave Requests</h2>
        <p className="text-muted-foreground">Manage employee leave requests</p>
      </div>
      <LeaveRequestTable showAddButton={true} />
    </div>
  )
}


export default LeaveRequestIndex