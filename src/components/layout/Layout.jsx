// React and core dependencies
import { Outlet } from "react-router-dom"

// UI Components
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header"

export function Layout() {
  const getSidebarState = () => {
    const sidebarState = document.cookie.split("; ").find((row) => row.startsWith("sidebar:state="))

    return sidebarState ? sidebarState.split("=")[1] === "true" : true
  }

  return (
    <SidebarProvider defaultOpen={getSidebarState()}>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          {/* Fixed Header */}
          <Header />
          {/* Scrollable Content with Padding */}
          <div className="flex-1 relative bg-gray-50">
            <div className="absolute inset-0 overflow-auto flex justify-center items-start p-4 md:p-8">
              <div className="w-full max-w-4xl">
                <Outlet />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
