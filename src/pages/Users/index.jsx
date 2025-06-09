"use client"

import UsersTable from "@/components/users/UsersTable"

export default function UsersPage() {
  return (
    <div className="container mx-auto">
      <div className="animate-in slide-in-from-top duration-500">
      <h1 className="text-2xl font-bold">Users Management</h1>
      <p className="text-muted-foreground mb-6">Manage users and their permissions</p>
      </div>
      <UsersTable />
    </div>
  )
} 