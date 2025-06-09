"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Search, MoreHorizontal, Edit, Trash2, UserPlus, AlertCircle, CloudAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableScrollWrapper } from "@/components/ui/TableScrollWrapper"
import UserForm from "@/components/users/UserForm"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog"

export function UsersTable() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/users")
        setUsers(response.data.filter(user => user.id))
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  // Filter users
  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3001/users/${userId}`)
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and action bar */}
      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-95 pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => navigate("/users/add")}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="w-full overflow-auto rounded-md border animate-in slide-in-from-left duration-500">
        <TableScrollWrapper>
          <Table className="w-full text-sm text-left">
            <TableHeader className="bg-black dark:bg-gray-50">
              <TableRow>
                <TableHead className="text-white font-bold">ID</TableHead>
                <TableHead className="text-white font-bold">Username</TableHead>
                <TableHead className="text-white font-bold">First Name</TableHead>
                <TableHead className="text-white font-bold">Last Name</TableHead>
                <TableHead className="text-white font-bold">Department</TableHead>
                <TableHead className="text-white font-bold">Position</TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow 
                    key={user.id} 
                    className={index % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : ""}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer"
                            onClick={() => {
                              setUserToEdit(user)
                              setEditOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer text-red-500"
                            onClick={() => {
                              setUserToDelete(user)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <CloudAlert className="mb-2 w-25 h-25 text-muted-foreground  " />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableScrollWrapper>
      </div>

      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User</AlertDialogTitle>
          </AlertDialogHeader>
          <UserForm 
            mode="edit" 
            userId={userToEdit?.id} 
            department={userToEdit?.department}
            gender={userToEdit?.gender}
            position={userToEdit?.position}
            onClose={() => setEditOpen(false)} 
          />
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this user?</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDeleteDialogOpen(false)} className="bg-gray-50 text-black shadow-sm hover:bg-gray-100">Cancel</AlertDialogAction>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:3001/users/${userToDelete.id}`)
                  setUsers(users.filter(user => user.id !== userToDelete.id))
                  setSuccessDialogOpen(true)
                } catch (error) {
                  console.error("Error deleting user:", error)
                  alert("Failed to delete user.")
                } finally {
                  setDeleteDialogOpen(false)
                  setUserToDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Deleted</AlertDialogTitle>
          </AlertDialogHeader>
          <p>User deleted successfully.</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessDialogOpen(false)} variant="ghost">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UsersTable 