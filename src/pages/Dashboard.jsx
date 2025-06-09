// Icons
import { Users, ExternalLink } from "lucide-react"

// UI Components
import { StatsCard } from "@/components/dashboard/StatsCard"


export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="animate-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of employee gatepasses and statistics</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-500">
        <StatsCard title="Number of Employees" value="405" icon={Users} />
        <StatsCard title="At Field" value="15" icon={ExternalLink} />
      </div>
    </div>
  )
}

export default Dashboard

