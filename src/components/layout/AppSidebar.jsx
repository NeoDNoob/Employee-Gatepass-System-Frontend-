"use client"

// React and core dependencies
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

//Icons
import { LayoutDashboard, FileStack, Settings, ChevronDown } from "lucide-react"

// Context
import { useAuth } from "@/context/AuthContext"

// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"


export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { user } = useAuth()
  const isAdmin = user?.isAdmin || false
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [signupCount, setSignupCount] = useState(0)
  const [resetCount, setResetCount] = useState(0)

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true
    }
    return path !== "/" && location.pathname.startsWith(path)
  }

  useEffect(() => {
    // Fetch pending signup requests
    axios.get("http://localhost:3001/pendingSignups")
      .then(res => setSignupCount(res.data?.length || 0))
      .catch(() => setSignupCount(0))
    // Fetch pending password reset requests
    axios.get("http://localhost:3001/forgotPasswordRequests")
      .then(res => setResetCount((res.data || []).filter(r => r.status === "Pending").length))
      .catch(() => setResetCount(0))
  }, [])

  return (
    <Sidebar collapsible="icon" className="bg- text-sidebar-foreground transition-all duration-300 ease-in-out">
      <SidebarHeader className="overflow-visible transition-opacity duration-300">
        <div className="p-2 flex items-center justify-center">
          <div className="flex items-center gap-2 transition-all duration-300">
            <a href="/">
              <img
                src="/src/assets/LOGO.svg"
                alt="Quezelco Logo"
                className="h-8 w-8 min-w-[24px] min-h-[24px] object-contain transition-all duration-300"
              />
            </a>
            <div
              className={`flex flex-col transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100"}`}
            >
              <span className="font-semibold whitespace-nowrap text-base font-sans">Q1 EMPLOYEE GATEPASS</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">Giving Light is Our Way of Life</span>
            </div>
          </div>
        </div>

        {!isCollapsed && (
          <form className="px-2 transition-opacity duration-300">
            <SidebarGroup className="py-0">
              <SidebarGroupContent className="relative"></SidebarGroupContent>
            </SidebarGroup>
          </form>
        )}
      </SidebarHeader>
      <SidebarContent>
        {/* Overview Section (all users) */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Overview</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard">
                  <Link to="/">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Forms and Tables Section (all users) */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Forms and Tables</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton type="button" onClick={() => setRequestsOpen((v) => !v)} tooltip="Requests">
                  <FileStack className="h-4 w-4" />
                  <span>Requests</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${requestsOpen ? "rotate-180" : "rotate-0"}`} />
                </SidebarMenuButton>
                {requestsOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/gatepass")}> 
                        <Link to="/gatepass">Gatepass</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/leave-request")}> 
                        <Link to="/leave-request">Leave Request</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Utility Section (admin only) */}
        {isAdmin && (
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Utility</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton type="button" onClick={() => setMaintenanceOpen((v) => !v)} tooltip="Maintenance">
                    <Settings className="h-4 w-4" />
                    <span>Maintenance</span>
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${maintenanceOpen ? "rotate-180" : "rotate-0"}`} />
                  </SidebarMenuButton>
                  {maintenanceOpen && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive("/maintenance/signup-requests")}>
                          <Link to="/maintenance/signup-requests">
                            Signup Requests
                           
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive("/users")}> 
                          <Link to="/users">Users</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive("/employee")}> 
                          <Link to="/employee">Employees</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive("/maintenance/password-reset-requests")}>
                          <Link to="/maintenance/password-reset-requests">
                            Password Reset
                           
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="transition-opacity duration-300">
        {!isCollapsed && (
          <div className="p-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Quezelco 1</p>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail className="transition-opacity duration-300" />
    </Sidebar>
  )
}

export default AppSidebar
