// Components
import { GatepassTable } from "@/components/gatepass/GatepassTable"

export function GatepassPage() {
  return (
  
      <div className="space-y-6">
        <div className="animate-in slide-in-from-top duration-500">
          <h2 className="text-2xl font-bold tracking-tight">Gatepasses</h2>
          <p className="text-muted-foreground">Manage employee gatepasses</p>
        </div>
        <GatepassTable showAddButton={true} />
      </div>
  )
}

export default GatepassPage

