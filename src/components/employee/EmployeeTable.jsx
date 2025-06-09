"use client"

// React & Router
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

// UI Components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { TableScrollWrapper } from "@/components/ui/TableScrollWrapper"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog"
import EmployeeForm from "@/components/employee/EmployeeForm"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

// Icons
import { Search, Plus, CloudAlert } from "lucide-react";

// Utils
import axios from "axios"

export function EmployeeTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeData, setEmployeeData] = useState([])
  const [editId, setEditId] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  // Fetch employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/employees")
        setEmployeeData(res.data)
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }
    fetchData()
  }, [])

  // Filter data by search
  const filteredData =
    searchTerm.trim() === ""
      ? employeeData
      : employeeData.filter((item) =>
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )

  const handleDelete = (id) => {
    setEmployeeToDelete(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search + Add button */}
      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button asChild>
          <Link to="/employee/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {/* Employee Table */}
      <TableScrollWrapper>
        <div className="w-full rounded-md border animate-in slide-in-from-left duration-500">
          <Table className="w-full text-sm text-left">
            <TableHeader className="bg-black dark:bg-gray-50">
              <TableRow>
                <TableHead className="text-white font-bold">Employee ID</TableHead>
                <TableHead className="text-white font-bold">First Name</TableHead>
                <TableHead className="text-white font-bold">Middle Name</TableHead>
                <TableHead className="text-white font-bold">Last Name</TableHead>
                <TableHead className="text-white font-bold">Date of Birth</TableHead>
                <TableHead className="text-white font-bold">Gender</TableHead>
                <TableHead className="text-white font-bold">Contact Number</TableHead>
                <TableHead className="text-white font-bold">Department</TableHead>
                <TableHead className="text-white font-bold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((employee, index) => (
                  <TableRow
                    key={employee.id}
                    className={index % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : ""}
                  >
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell className="py-3">{employee.firstName}</TableCell>
                    <TableCell>{employee.middleName}</TableCell>
                    <TableCell>{employee.lastName}</TableCell>
                    <TableCell>{employee.dob}</TableCell>
                    <TableCell>{employee.gender}</TableCell>
                    <TableCell>{employee.contactNumber}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-center">
                      <Dialog open={editOpen && editId === employee.id} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditId(null) }}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 p-1">
                            <DropdownMenuItem onClick={() => { setEditId(employee.id); setEditOpen(true) }} className="hover:bg-gray-100">
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(employee.id)} className="hover:bg-gray-100">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogContent>
                          <DialogTitle>Edit Employee</DialogTitle>
                          <EmployeeForm mode="edit" employeeId={employee.id} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <CloudAlert className="mb-2 w-25 h-25 text-muted-foreground" />
                      <p className="text-muted-foreground">No employees found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TableScrollWrapper>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this employee?</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDeleteDialogOpen(false)} className=" shadow-sm bg-gray-50 text-black hover:bg-gray-100">
              Cancel
            </AlertDialogAction>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:3001/employees/${employeeToDelete}`);
                  setEmployeeData((prevData) => prevData.filter((employee) => employee.id !== employeeToDelete));
                  alert("Employee deleted successfully.");
                } catch (error) {
                  console.error("Error deleting employee:", error);
                  alert("Failed to delete employee.");
                } finally {
                  setDeleteDialogOpen(false);
                  setEmployeeToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default EmployeeTable
