// Components
import { EmployeeForm } from "@/components/employee/EmployeeForm"

export function AddEmployee() {
  return (
    <div className="space-y-6">
      <div className="animate-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Add Employee</h2>
        <p className="text-muted-foreground">Add a new employee to the system</p>
      </div>

      <EmployeeForm />
    </div>
  )
}

export default AddEmployee

