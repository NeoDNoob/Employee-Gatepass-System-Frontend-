"use client"



// Components
import { EmployeeTable } from "@/components/employee/EmployeeTable"

export function EmployeePage() {
  return (
    <div className="space-y-6 ">
      <div className="animate-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Employee Information</h2>
        <p className="text-muted-foreground">Manage employee records</p>
      </div>
      <EmployeeTable />
    </div>
  )
}

export default EmployeePage
