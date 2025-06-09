"use client"

import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Layout } from "@/components/layout/Layout"
import { Dashboard } from "@/pages/Dashboard"
import { GatepassPage } from "@/pages/Gatepass"
import { CreateGatepass } from "@/pages/Gatepass/Create"
import { EmployeePage } from "@/pages/Employee"
import { AddEmployee } from "@/pages/Employee/Add"
import { SignupRequests } from "@/pages/Maintenance/SignupRequests"
import LeaveRequestIndex from "@/pages/Leave/Index"
import CreateLeaveRequest from "@/pages/Leave/Create"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import UsersPage from "@/pages/Users"
import AddUserPage from "@/pages/Users/add"
import PasswordResetRequests from "@/pages/Maintenance/PasswordResetRequests"
import PasswordReset from "@/pages/PasswordReset"
import GatepassReport from "@/pages/Reports/GatepassReport"
import LeaveReport from "@/pages/Reports/LeaveReport"

export function AppRoutes() {
  const { isLogged, user } = useAuth()  
  const isAdmin = user?.isAdmin || false

  return (
    <Routes>
      {!isLogged ? (
        <>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gatepass" element={<GatepassPage />} />
            <Route path="/gatepass/create" element={<CreateGatepass />} />
            <Route path="/leave-request" element={<LeaveRequestIndex />} />
            <Route path="/leave-request/create" element={<CreateLeaveRequest />} />

            {isAdmin && (
              <>
                <Route path="/maintenance/signup-requests" element={<SignupRequests />} />
                <Route path="/maintenance/password-reset-requests" element={<PasswordResetRequests />} />
                <Route path="/employee" element={<EmployeePage />} />
                <Route path="/employee/add" element={<AddEmployee />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/add" element={<AddUserPage />} />
              </>
            )}

            <Route path="/reports/gatepass" element={<GatepassReport />} />
            <Route path="/reports/leave" element={<LeaveReport />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

export default AppRoutes
