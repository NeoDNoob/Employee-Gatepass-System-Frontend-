"use client"

// React and core dependencies
import { useEffect, useState } from "react"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// UI Components
import { Search, CloudAlert } from "lucide-react"
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
import { TableScrollWrapper } from "@/components/ui/TableScrollWrapper"

// Icons
import { Printer, MoreHorizontal, Edit } from "lucide-react"

// Context 
import { useAuth } from "@/context/AuthContext"

// Dropdown menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Additional imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePickerWithRange from "@/components/ui/DatePickerWithRange"

export function LeaveRequestTable({ showAddButton = true }) {
  // State management
  const [leaveRequests, setLeaveRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentLeaveRequest, setCurrentLeaveRequest] = useState(null)
  const [editDateRange, setEditDateRange] = useState({ from: null, to: null })

  // Validation schema for editing
  const editLeaveRequestSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Leave type is required"),
    shift: z.string().min(1, "Shift is required"),
    totalDays: z.string().min(1, "Total days is required"),
    status: z.string().optional(),
  })

  // Edit form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editLeaveRequestSchema),
  })

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/leaveRequests")

        // Filter logic
        if (user?.username === "admin") {
          setLeaveRequests(response.data)
        } else if (user) {
          const filteredRequests = response.data.filter((request) => {
            const isRequestForUser = request.name === `${user.firstName} ${user.lastName}`
            const isCreatedByUser = request.preparedBy === `${user.firstName} ${user.lastName}`
            return isRequestForUser || isCreatedByUser
          })
          setLeaveRequests(filteredRequests)
        } else {
          setLeaveRequests([])
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error)
        setLeaveRequests([])
      }
    }
    fetchData()
  }, [user])

  // Filter data based on search term
  const filteredData = leaveRequests.filter((item) =>
    searchTerm.trim() === "" ? true :
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  // Helper functions
  const formatDateRange = (from, to) => {
    if (!from || !to) return "N/A"
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const fromStr = fromDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })
    const toStr = toDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })

    return fromStr === toStr
      ? <div><strong>From:</strong> {fromStr}</div>
      : <><div><strong>From:</strong> {fromStr}</div><div><strong>To:</strong> {toStr}</div></>
  }

  const handlePrint = (leave) => {
    const printCloudAlertow = CloudAlertow.open("", "_blank", "width=1000,height=800")
    const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    }) : "N/A"

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Leave Request ${leave.id}</title>
        <style>
          @page { size: A4; margin: 1cm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .leave-container { max-width: 800px; margin: 0 auto; padding: 32px; border: 1px solid #ccc; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
          .header img { height: 45px; }
          .header-text { }
          .title { font-size: 20px; font-weight: bold; }
          .subtitle { font-size: 14px; margin-top: 2px; }
          .section { margin-bottom: 24px; }
          .row { display: flex; margin-bottom: 10px; }
          .label { font-weight: bold; width: 180px; }
          .value { flex: 1; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
          .signature-box { text-align: center; width: 220px; }
          .signature-line { border-top: 1px solid #000; width: 100%; margin: 20px 0 5px 0; }
          .signature-title { margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="leave-container">
          <div class="header">
            <img src="/src/assets/LOGO.svg" alt="Logo">
            <div class="header-text">
              <div class="title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
              <div class="subtitle">EMPLOYEE LEAVE REQUEST</div>
              <div class="subtitle">Reference No: ${leave.id}</div>
            </div>
          </div>
          <div class="section">
            <div class="row"><div class="label">Employee Name:</div><div class="value">${leave.name}</div></div>
            <div class="row"><div class="label">I.D. No.:</div><div class="value">${leave.idNumber || "N/A"}</div></div>
            <div class="row"><div class="label">Date Range:</div><div class="value">From: ${formatDate(leave.from)} To: ${formatDate(leave.to)}</div></div>
            <div class="row"><div class="label">Shift:</div><div class="value">${leave.shift}</div></div>
            <div class="row"><div class="label">Total Days:</div><div class="value">${leave.totalDays}</div></div>
            <div class="row"><div class="label">Leave Type:</div><div class="value">${leave.type === "Others" ? leave.othersType : leave.type}</div></div>
          </div>
          <div class="section">
            <div class="row"><div class="label">Prepared by:</div><div class="value">${leave.preparedBy}</div></div>
            <div class="row"><div class="label">Recommending Approval:</div><div class="value">${leave.recommendingApproval}</div></div>
          </div>
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-title">Employee Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-title">Approver Signature</div>
            </div>
          </div>
        </div>
        <script>CloudAlertow.onload = function() { CloudAlertow.print(); };</script>
      </body>
      </html>
    `
    printCloudAlertow.document.write(htmlContent)
    printCloudAlertow.document.close()
  }

  // Updated handleEdit function
  const handleEdit = (leaveRequest) => {
    setCurrentLeaveRequest(leaveRequest)
    setValue("name", leaveRequest.name)
    setValue("type", leaveRequest.type)
    setValue("shift", leaveRequest.shift)
    setValue("totalDays", leaveRequest.totalDays)
    setValue("status", leaveRequest.status)
    setEditDateRange({
      from: leaveRequest.from ? new Date(leaveRequest.from) : null,
      to: leaveRequest.to ? new Date(leaveRequest.to) : null,
    })
    setIsEditModalOpen(true)
  }

  // Submit edit handler
  const onEditSubmit = async (data) => {
    try {
      // Prepare updated leave request data
      const updatedLeaveRequest = {
        ...currentLeaveRequest,
        ...data,
      }

      // Send update request
      const response = await axios.put(`http://localhost:3001/leaveRequests/${currentLeaveRequest.id}`, updatedLeaveRequest)

      if (response.status === 200) {
        // Update local state
        setLeaveRequests(prevData =>
          prevData.map(lr => lr.id === currentLeaveRequest.id ? updatedLeaveRequest : lr)
        )

        // Close modal
        setIsEditModalOpen(false)

        // Optional: Show success toast/notification
        alert("Leave request updated successfully!")
      }
    } catch (error) {
      console.error("Error updating leave request:", error)
      alert("Failed to update leave request. Please try again.")
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and action bar */}
      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leave requests..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <a href="/leave-request/create">Add Leave Request</a>
        </Button>
      </div>

      {/* Table with scroll wrapper */}
      <div className="w-full overflow-auto rounded-md border animate-in slide-in-from-left duration-500">
        <TableScrollWrapper>
          <Table className="w-full text-sm text-left">
            <TableHeader className="bg-black dark:bg-gray-50">
              <TableRow>
                <TableHead className="text-white font-bold">Reference No.</TableHead>
                <TableHead className="text-white font-bold">Name</TableHead>
                <TableHead className="text-white font-bold">Date Range</TableHead>
                <TableHead className="text-white font-bold">Type</TableHead>
                <TableHead className="text-white font-bold">Shift</TableHead>
                <TableHead className="text-white font-bold">Total Days</TableHead>
                <TableHead className="text-white font-bold">Prepared By</TableHead>
                <TableHead className="text-white font-bold">Prepared For</TableHead>
                <TableHead className="text-white font-bold">Recommending Approval</TableHead>
                <TableHead className="text-white font-bold">Status</TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((req, idx) => (
                  <TableRow
                    key={req.id}
                    className={idx % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : ""}
                  >
                    <TableCell>{req.id}</TableCell>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>{formatDateRange(req.from, req.to)}</TableCell>
                    <TableCell>{req.type === "Others" ? req.othersType : req.type}</TableCell>
                    <TableCell>{req.shift}</TableCell>
                    <TableCell>{req.totalDays}</TableCell>
                    <TableCell>{req.preparedBy}</TableCell>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>{req.recommendingApproval}</TableCell>
                    <TableCell>{req.status}</TableCell>
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
                            onClick={() => handlePrint(req)}
                          >
                            <Printer className="mr-2 h-4 w-4" /> Print
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer"
                            onClick={() => handleEdit(req)}
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
                  <TableCell colSpan={11} className="text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <CloudAlert className="mb-2 w-25 h-25 text-muted-foreground" />
                      <p className="text-muted-foreground">No leave requests found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableScrollWrapper>
      </div>

      {/* Edit Leave Request Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name</Label>
              <Input
                value={currentLeaveRequest?.name || ""}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                className="flex-1"
                onChange={(range) => {
                  setEditDateRange(range)
                  setValue("from", range.from)
                  setValue("to", range.to)
                }}
                value={editDateRange}
              />
              {errors.from && <span className="text-red-500 text-xs">{errors.from.message}</span>}
              {errors.to && <span className="text-red-500 text-xs">{errors.to.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shift</Label>
                <Input
                  placeholder="e.g., Morning"
                  {...register("shift")}
                />
                {errors.shift && <p className="text-red-500 text-xs">{errors.shift.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Total Days</Label>
                <Input
                  type="number"
                  {...register("totalDays")}
                />
                {errors.totalDays && <p className="text-red-500 text-xs">{errors.totalDays.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Leave Type</Label>
              <RadioGroup
                value={watch("type")}
                onValueChange={(value) => setValue("type", value)}
              >
                <div className="grid grid-cols-2 gap-2">
                  {["Sick Leave", "Maternity / Paternity Leave", "Bereavement", "Vacation Leave", "Birthday Leave", "Others"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type}>{type}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={currentLeaveRequest?.status || ""}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeaveRequestTable 