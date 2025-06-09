"use client"

// React and core dependencies
import { useEffect, useState } from "react"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TableScrollWrapper } from "@/components/ui/TableScrollWrapper"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DateTimeRangePicker from "@/components/ui/DateTimeRangePicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog"

// Icons
import { Search, Printer, MoreHorizontal, Edit, CloudAlert } from "lucide-react"

// Context and utilities
import { useAuth } from "@/context/AuthContext"
import { printGatepass } from "@/utils/print"
import { format } from "date-fns"
import { Combobox } from "./GatepassForm"

export function GatepassTable({ showAddButton = true }) {
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [gatepassData, setGatepassData] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true)
  const [employeesError, setEmployeesError] = useState(null)
  const { user } = useAuth()
  const [currentGatepass, setCurrentGatepass] = useState(null)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [alertDialogMessage, setAlertDialogMessage] = useState("")
  const [modalDateTimeRange, setModalDateTimeRange] = useState(null)
  const [modalServiceVehicle, setModalServiceVehicle] = useState("")
  const [modalTimeOut, setModalTimeOut] = useState("")
  const [modalTimeIn, setModalTimeIn] = useState("")
  const [modalPreparedBy, setModalPreparedBy] = useState("")
  const [modalAssignatory, setModalAssignatory] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editGatepassId, setEditGatepassId] = useState(null)
  const [editFields, setEditFields] = useState({
    department: "",
    destination: "",
    employees: [],
    preparedBy: "",
    assignatory: "",
    purpose: "",
    dateTimeRange: { from: null, to: null },
    serviceVehicle: "",
    timeOut: "",
    timeIn: "",
  })
  // Add test input state for debugging modal interactivity
  const [testInputValue, setTestInputValue] = useState("")

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsEmployeesLoading(true)
      setEmployeesError(null)
      try {
        const response = await axios.get("http://localhost:3001/employees")
        // Assuming the response contains an array of employees with a fullName or name field
        const employeeNames = response.data.map(emp =>
          emp.fullName || `${emp.firstName} ${emp.lastName}`.trim()
        ).filter(name => name.trim() !== '') // Remove any empty names
        setEmployeeOptions(employeeNames)
      } catch (error) {
        console.error("Error fetching employees:", error)
        setEmployeesError("Failed to load employees. Please try again.")
        setEmployeeOptions([])
      } finally {
        setIsEmployeesLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Department options
  const departmentOptions = [
    "Corporate Planning",
    "CAD",
    "Marketing",
    "Finance",
    "Administration",
    "Operations and Maintenance",
    "Internal Audit",
    "Engineering",
  ]

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/gatepasses")

        if (user) {
          let gatepasses = response.data
          // Check if the user is an admin
          const isAdmin = user.isAdmin

          if (!isAdmin) {
            // Filter gatepasses for non-admin users
            gatepasses = gatepasses.filter((gatepass) => {
              const isCreator = gatepass.createdBy === user.username
              const isEmployee = gatepass.employees?.includes(user.fullName)
              return isCreator || isEmployee
            })
          }

          setGatepassData(gatepasses)
        } else {
          setGatepassData([])
        }
      } catch (error) {
        setGatepassData([])
      }
    }

    fetchData()
  }, [user])

  // Data filtering
  const filteredData = gatepassData?.filter((item) =>
    Object.values(item).some((value) => {
      if (value && typeof value === "object" && (value.from || value.to)) {
        return (
          value.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          value.to?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      if (Array.isArray(value)) {
        return value.some((v) =>
          v?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  ) || []

  // Helper functions
  const formatDateTime = (gatepass) => {
    if (gatepass.dateTimeRange) {
      const { from, to } = gatepass.dateTimeRange
      const fromDate = from ? new Date(from) : null
      const toDate = to ? new Date(to) : null

      return (
        <>
          <div>
            <strong>From:</strong>{" "}
            {fromDate ? format(fromDate, "MMM dd, yyyy hh:mm a") : "N/A"}
          </div>
          <div>
            <strong>To:</strong>{" "}
            {toDate ? format(toDate, "MMM dd, yyyy hh:mm a") : "N/A"}
          </div>
        </>
      )
    }
    return gatepass.dateTime || "N/A"
  }

  // Open edit modal and prefill fields
  const openEditModal = (gatepass) => {
    setEditGatepassId(gatepass.id)
    setEditFields({
      department: gatepass.department || "",
      destination: gatepass.destination || "",
      employees: gatepass.employees || [],
      preparedBy: gatepass.preparedBy || "",
      assignatory: gatepass.assignatory || "",
      purpose: gatepass.purpose || "",
      dateTimeRange: gatepass.dateTimeRange || { from: null, to: null },
      serviceVehicle: gatepass.serviceVehicle || "",
      timeOut: gatepass.timeOut || "",
      timeIn: gatepass.timeIn || "",
    })
    setIsEditModalOpen(true)
  }

  // Handle edit field changes
  const handleEditField = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }))
  }

  // Submit update
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:3001/gatepasses/${editGatepassId}`, {
        ...editFields,
        id: editGatepassId,
      })
      setIsEditModalOpen(false)
      setEditGatepassId(null)
      // Refresh data
      const response = await axios.get("http://localhost:3001/gatepasses")
      setGatepassData(response.data)
    } catch (error) {
      setAlertDialogMessage("Failed to update gatepass. Please try again.")
      setIsAlertDialogOpen(true)
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
            placeholder="Search gatepasses..."
            className="w-95 pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showAddButton && (
          <Button asChild>
            <a href="/gatepass/create">Add Gatepass</a>
          </Button>
        )}
      </div>

      {/* Table with scrollable wrapper */}
      <div className="w-full overflow-auto rounded-md border animate-in slide-in-from-left duration-500">
        <TableScrollWrapper>
          <Table className="w-full text-sm text-left">
            <TableHeader className="bg-black dark:bg-gray-50">
              <TableRow>
                <TableHead className="text-white font-bold">Reference</TableHead>
                <TableHead className="text-white font-bold">Department</TableHead>
                <TableHead className="text-white font-bold">Date/Time Range</TableHead>
                <TableHead className="text-white font-bold">Destination</TableHead>
                <TableHead className="text-white font-bold">Purpose</TableHead>
                <TableHead className="text-white font-bold">Prepared By</TableHead>
                <TableHead className="text-white font-bold">Prepared For</TableHead>
                <TableHead className="text-white font-bold">Status</TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((gatepass, index) => (
                  <TableRow
                    key={gatepass.id}
                    className={index % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : ""}
                  >
                    <TableCell>{gatepass.id}</TableCell>
                    <TableCell>{gatepass.department}</TableCell>
                    <TableCell className="whitespace-normal min-w-[200px]">
                      {formatDateTime(gatepass)}
                    </TableCell>
                    <TableCell>{gatepass.destination}</TableCell>
                    <TableCell>{gatepass.purpose}</TableCell>
                    <TableCell>{gatepass.preparedBy}</TableCell>

                    {/* Prepared For (Employees) popover */}
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {gatepass.employees?.length || 0} Employee(s)
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-auto">
                          <ul className="list-disc pl-6">
                            {gatepass.employees?.map((employee) => (
                              <li key={employee}>{employee}</li>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>
                    </TableCell>

                    <TableCell>{gatepass.status}</TableCell>

                    {/* Actions dropdown */}
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
                            onClick={() => printGatepass(gatepass)}
                          >
                            <Printer className="mr-2 h-4 w-4" /> Print
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer"
                            onClick={() => openEditModal(gatepass)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <CloudAlert className="mb-2 w-25 h-25 text-muted-foreground" />
                      <p className="text-muted-foreground">No gatepass found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableScrollWrapper>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
          </AlertDialogHeader>
          <p>{alertDialogMessage}</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Edit Gatepass</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
           
            <div className="space-y-2">
            
              <Label>Department</Label>
              <Select
                value={editFields.department}
                onValueChange={val => handleEditField("department", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
          
              <Label>Date & Time Range</Label>
              <DateTimeRangePicker
                className="w-full p-0 z-[9999]"
                value={editFields.dateTimeRange}
                onChange={val => handleEditField("dateTimeRange", val)}
              />
            </div>
            <div className="space-y-2">
           
              <Label>Destination</Label>
              <Input
                value={editFields.destination}
                onChange={e => handleEditField("destination", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              
              <Label>Employees</Label>
              <Combobox
                placeholder="Select employees"
                options={employeeOptions}
                value={editFields.employees}
                onValueChange={val => handleEditField("employees", val)}
              />
            </div>
            <div className="space-y-2"> 
              <Label>Prepared by</Label>
              <Combobox
                className="w-full p-0 z-[9999]"
                placeholder="Select preparer"
                options={employeeOptions}
                value={editFields.preparedBy ? [editFields.preparedBy] : []}
                onValueChange={val => handleEditField("preparedBy", val[0] || "")}
              />
            </div>
            <div className="space-y-2">
              <Label>Assignatory</Label>
              <Combobox
                placeholder="Select assignatory"
                options={employeeOptions.filter(emp => emp !== editFields.preparedBy)}
                value={editFields.assignatory ? [editFields.assignatory] : []}
                onValueChange={val => handleEditField("assignatory", val[0] || "")}
              />
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                value={editFields.purpose}
                onChange={e => handleEditField("purpose", e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Gatepass</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GatepassTable



