"use client"

// Components
import LeaveRequestForm from "@/components/leave/LeaveRequestForm"


export function CreateLeaveRequest() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Create Leave Request</h2>
        <p className="text-muted-foreground">Fill out the form to request a leave.</p>
      </div>
      <LeaveRequestForm/>
    </div>
  )
}

export default CreateLeaveRequest
