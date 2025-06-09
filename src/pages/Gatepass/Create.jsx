// Components
import { GatepassForm } from "@/components/gatepass/GatepassForm"

export function CreateGatepass() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Create Gatepass</h2>
        <p className="text-muted-foreground">Create a new employee gatepass</p>
      </div>
      <GatepassForm />
    </div>
  )
}

export default CreateGatepass

