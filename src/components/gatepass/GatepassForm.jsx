"use client"

// React and core dependencies
import { format, addDays } from "date-fns"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DateTimeRangePicker from "@/components/ui/DateTimeRangePicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

// Icons
import { Check, ChevronsUpDown, X, Printer } from "lucide-react"

// Utils
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

// Validation schema
const gatepassSchema = z.object({
  department: z.string().min(2, {
    message: "Department must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  employees: z.array(z.string()).optional(),
  preparedBy: z.string().optional(),
  assignatory: z.string().optional(),
  purpose: z.string().min(2, {
    message: "Purpose must be at least 2 characters.",
  }),
})

// Constants
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

// Combobox component
const Combobox = ({ options, value, onValueChange, placeholder }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filteredOptions =
    query === "" ? options : options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value?.length > 0 ? value.join(", ") : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search employees..." onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>No employee found.</CommandEmpty>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => {
                  if (value?.includes(option)) {
                    onValueChange(value.filter((item) => item !== option))
                  } else {
                    onValueChange([...(value || []), option])
                  }
                  setOpen(false)
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value?.includes(option) ? "opacity-100" : "opacity-0")} />
                {option}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }

// Function to print gatepass
const printGatepass = (gatepass) => {
  if (!gatepass) return

  const formatDateTime = (dateTimeRange) => {
    if (!dateTimeRange) return { from: "N/A", to: "N/A" }
    return {
      from: dateTimeRange.from || "N/A",
      to: dateTimeRange.to || "N/A",
    }
  }

  const dateTime = formatDateTime(gatepass.dateTimeRange)

  const createEmployeeGrid = (employees) => {
    if (!employees || employees.length === 0) return '<div class="employee-item">None</div>'

    const empList = Array.isArray(employees) ? employees : [employees]

    let html = '<div class="employee-grid">'
    for (let i = 0; i < empList.length; i++) {
      html += `<div class="employee-item">${empList[i]}</div>`
    }
    html += "</div>"

    return html
  }

  const printWindow = window.open("", "_blank", "width=1000,height=800")

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Gatepass ${gatepass.id}</title>
      <style>
        /* Set consistent page size */
        @page {
          size: legal landscape;
          margin: 0.5cm;
        }
        
        /* Reset styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        /* Base styles */
        html, body {
          font-family: Arial, sans-serif;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        /* Container for the two gate passes */
        .print-container {
        display: flex;
        width: 100%;
        height: 100vh;
        min-height: 100%; 
        position: relative; 
        }

        .print-container::after {
          content: '';
          display: block;
          width: 2px; 
          background-color: #000; 
          height: 100%; 
          position: absolute; /* Position it absolutely */
          left: 50%; /* Center it horizontally */
          transform: translateX(-50%); /* Adjust to center */
          border-left: 2px dashed #000; /* Dashed line for visibility */
          z-index: 1; /* Ensure it appears above other elements */
       }
        
        /* Each gate pass card */
        .gatepass-card {
          flex: 1;
          
          padding: 20px;
          font-size: 14px;
          height: 100%;
          position: relative;
        }
        
        /* The divider between the two copies */
        .print-divider {
          width: 1px;
          background-color: #000; 

          height: 100vh;
          margin: 0; 
          position: relative; 
        }
        
        /* Header with logo and title */
        .gatepass-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .gatepass-header img {
          height: 45px;
          width: auto;
        }
        
        /* Title styling */
        .header-text {
          text-align: left;
        }
        
        .gatepass-title {
          font-size: 16px;
          font-weight: bold;
          line-height: 1.2;
        }
        
        .gatepass-subtitle {
          font-size: 13px;
          margin-top: 2px;
          line-height: 1.2;
        }
        
        /* Content section */
        .gatepass-content {
          margin-bottom: 30px;
        }
        
        /* Row layout for label-value pairs */
        .gatepass-row {
          display: flex;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        
        /* Label styling */
        .gatepass-label {
          font-weight: bold;
          width: 140px;
          flex-shrink: 0;
        }
        
        /* Value styling */
        .gatepass-value {
          flex: 1;
        }
        
        /* Employee grid */
        .employee-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        
        .purpose-box {
          min-height: 60px;
        }
        
        /* Fixed position sections at the bottom */
        .bottom-sections {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
        }

        /* Signature section */
        .signature-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .signature-box {
          text-align: center;
          width: 220px;
        }

        .signature-label {
          font-weight: bold;
          margin-bottom: 15px;
        }

        .signature-name {
          margin-bottom: 8px;
        }

        .signature-line {
          border-top: 1px solid #000;
          width: 100%;
          margin: 5px 0;
        }

        .signature-title {
          margin-top: 5px;
        }

        /* Time section with guard signature */
        .time-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .time-box {
          width: 48%;
        }

        .guard-signature {
          width: 48%;
          text-align: center;
        }

        /* Travel verification section */
        .travel-verification {
          margin-bottom: 0;
        }

        .verification-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        /* Ensure uniform text throughout */
        .gatepass-card * {
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="gatepass-card">
          <div class="gatepass-header">
            <img src="/src/assets/LOGO.svg" alt="Logo">
            <div class="header-text">
              <div class="gatepass-title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
              <div class="gatepass-subtitle">EMPLOYEE GATEPASS</div>
              <div class="gatepass-subtitle">Reference No: ${gatepass.id}</div>
            </div>
          </div>

          <div class="gatepass-content">
            <div class="gatepass-row">
              <div class="gatepass-label">Employee(s):</div>
              <div class="gatepass-value">
                ${createEmployeeGrid(gatepass.employees)}
              </div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Department:</div>
              <div class="gatepass-value">${gatepass.department}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Service Vehicle:</div>
              <div class="gatepass-value">${gatepass.serviceVehicle || "N/A"}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">From:</div>
              <div class="gatepass-value">${dateTime.from}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">To:</div>
              <div class="gatepass-value">${dateTime.to}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Destination:</div>
              <div class="gatepass-value">${gatepass.destination}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Purpose:</div>
              <div class="gatepass-value purpose-box">${gatepass.purpose}</div>
            </div>
          </div>

          <div class="bottom-sections">
            <div class="signature-container">
              <div class="signature-box">
                <div class="signature-label">Prepared by:</div>
                <div class="signature-name">${gatepass.preparedBy || "User's Full Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.preparedByPosition || "Position"}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Approved by:</div>
                <div class="signature-name">${gatepass.assignatory || "Approver's Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.assignatoryPosition || "Position"}</div>
              </div>
            </div>

            <div class="time-section">
              <div class="time-box">
                <div class="gatepass-row">
                  <div class="gatepass-label">Time Out:</div>
                  <div class="gatepass-value">${gatepass.timeOut || "____:____"}</div>
                </div>
                <div class="gatepass-row">
                  <div class="gatepass-label">Time In:</div>
                  <div class="gatepass-value">${gatepass.timeIn || "____:____"}</div>
                </div>
              </div>
              <div class="guard-signature">
                <div class="signature-label">Guard on Duty:</div>
                <div class="signature-line"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>

            <div class="travel-verification">
              <div class="verification-title">TRAVEL VERIFICATION</div>
              <div class="gatepass-row">
                <div class="gatepass-label">Person/s Visited:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div class="gatepass-row">
                <div class="gatepass-label">Date and Time:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <div class="signature-line" style="margin: 0 auto; width: 220px;"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div class="print-divider"></div>

        <div class="gatepass-card">
          <div class="gatepass-header">
            <img src="/src/assets/LOGO.svg" alt="Logo">
            <div class="header-text">
              <div class="gatepass-title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
              <div class="gatepass-subtitle">EMPLOYEE GATEPASS</div>
              <div class="gatepass-subtitle">Reference No: ${gatepass.id}</div>
            </div>
          </div>

          <div class="gatepass-content">
            <div class="gatepass-row">
              <div class="gatepass-label">Employee(s):</div>
              <div class="gatepass-value">
                ${createEmployeeGrid(gatepass.employees)}
              </div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Department:</div>
              <div class="gatepass-value">${gatepass.department}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Service Vehicle:</div>
              <div class="gatepass-value">${gatepass.serviceVehicle || "N/A"}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">From:</div>
              <div class="gatepass-value">${dateTime.from}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">To:</div>
              <div class="gatepass-value">${dateTime.to}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Destination:</div>
              <div class="gatepass-value">${gatepass.destination}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Purpose:</div>
              <div class="gatepass-value purpose-box">${gatepass.purpose}</div>
            </div>
          </div>

          <div class="bottom-sections">
            <div class="signature-container">
              <div class="signature-box">
                <div class="signature-label">Prepared by:</div>
                <div class="signature-name">${gatepass.preparedBy || "User's Full Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.preparedByPosition || "Position"}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Approved by:</div>
                <div class="signature-name">${gatepass.assignatory || "Approver's Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.assignatoryPosition || "Position"}</div>
              </div>
            </div>

            <div class="time-section">
              <div class="time-box">
                <div class="gatepass-row">
                  <div class="gatepass-label">Time Out:</div>
                  <div class="gatepass-value">${gatepass.timeOut || "____:____"}</div>
                </div>
                <div class="gatepass-row">
                  <div class="gatepass-label">Time In:</div>
                  <div class="gatepass-value">${gatepass.timeIn || "____:____"}</div>
                </div>
              </div>
              <div class="guard-signature">
                <div class="signature-label">Guard on Duty:</div>
                <div class="signature-line"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>

            <div class="travel-verification">
              <div class="verification-title">TRAVEL VERIFICATION</div>
              <div class="gatepass-row">
                <div class="gatepass-label">Person/s Visited:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div class="gatepass-row">
                <div class="gatepass-label">Date and Time:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <div class="signature-line" style="margin: 0 auto; width: 220px;"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export function GatepassForm() {
  // Hooks and state
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [createdGatepass, setCreatedGatepass] = useState(null)
  const [departmentEmployees, setDepartmentEmployees] = useState([])
  const [departmentManagers, setDepartmentManagers] = useState({})
  const [preparedBy, setPreparedBy] = useState(user?.fullName || "")
  const [assignatory, setAssignatory] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gatepassSchema),
    defaultValues: {
      preparedBy: user?.fullName || "",
      assignatory: "",
      dateTimeRange: { from: null, to: null },
    },
  })

  // Helper functions
  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
    navigate("/gatepass")
  }

  const removeEmployee = (employee) => {
    setEmployees((prev) => prev.filter((e) => e !== employee))
  }

  const getFormattedDateTime = (dateRange) => {
    if (!dateRange?.from) return null
    const fromFormatted = format(dateRange.from, "MMM dd, yyyy hh:mm a")
    const toFormatted = dateRange.to ? format(dateRange.to, "MMM dd, yyyy hh:mm a") : fromFormatted
    return {
      from: fromFormatted,
      to: toFormatted,
    }
  }

  // Effects
  const fetchDepartmentData = useCallback(async () => {
    if (user?.department) {
      try {
        const response = await axios.get("http://localhost:3001/employees")
        
        // Change to show all employees instead of filtering by department
        const allEmployees = response.data.map((emp) => `${emp.firstName} ${emp.lastName}`)
        setDepartmentEmployees(allEmployees)

        const managers = {}
        const departmentManager = response.data.find(
          (emp) =>
            emp.department === user.department &&
            (emp.position?.toLowerCase().includes("manager") || emp.position?.toLowerCase().includes("head"))
        )

        if (departmentManager) {
          const managerFullName = `${departmentManager.firstName} ${departmentManager.lastName}`
          managers[user.department] = managerFullName
          setAssignatory(managerFullName)
          setValue("assignatory", managerFullName)
        }

        setDepartmentManagers(managers)
        setValue("department", user.department)
        setPreparedBy(user?.fullName || "")
        setValue("preparedBy", user?.fullName || "")
      } catch (error) {
        console.error("Error fetching department data:", error)
      }
    }
  }, [user, setValue])

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:3001/employees")

        // Remove department filtering to show all employees
        const allEmployees = response.data.map((emp) => `${emp.firstName} ${emp.lastName}`)

        setEmployeeOptions(allEmployees)
      } catch (error) {
        console.error("Error loading employees:", error)
      }
    }
    fetchEmployees()
  }, [user])

  useEffect(() => {
    fetchDepartmentData()
  }, [fetchDepartmentData])

  useEffect(() => {
    // Set the department value to the current user's department
    if (user?.department) {
      setValue("department", user.department)
    }

    // Set the assignatory value if available
    if (assignatory) {
      setValue("assignatory", assignatory)
    }

    // Set the current user as the default preparer
    if (user?.fullName) {
      setValue("preparedBy", user.fullName)
    }
  }, [user, assignatory, setValue])

  // Auto-print when gatepass is created
  useEffect(() => {
    if (createdGatepass && isSuccessModalOpen) {
      // Small delay to ensure the component is rendered
      const timer = setTimeout(() => {
        printGatepass(createdGatepass)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [createdGatepass, isSuccessModalOpen])

  const onSubmit = async (data, event) => {
    event?.preventDefault() // Prevent form default behavior

    try {
      // Fetch existing gatepasses
      const response = await axios.get("http://localhost:3001/gatepasses")
      const gatepasses = response.data

      // Generate new ID
      let newId = "GP-001"
      if (gatepasses.length > 0) {
        const lastGatepass = gatepasses[gatepasses.length - 1]
        const lastIdNumber = Number.parseInt(lastGatepass.id.replace("GP-", ""), 10)
        newId = `GP-${String(lastIdNumber + 1).padStart(3, "0")}`
      }

      // Fetch employee positions
      const employeesResponse = await axios.get("http://localhost:3001/employees")
      const employeesData = employeesResponse.data

      // Get positions for preparer and assignatory
      const preparerData = employeesData.find(emp => `${emp.firstName} ${emp.lastName}` === preparedBy)
      const assignatoryData = employeesData.find(emp => `${emp.firstName} ${emp.lastName}` === assignatory)

      // Prepare data payload with dateTimeRange
      const payload = {
        id: newId,
        ...data,
        employees,
        preparedBy: preparedBy || user?.fullName || "",
        preparedByPosition: preparerData?.position || "Employee",
        assignatory: assignatory || "",
        assignatoryPosition: assignatoryData?.position || "Manager",
        dateTimeRange: getFormattedDateTime(data.dateTimeRange),
        status: "Pending",
        createdBy: user?.username || "unknown",
      }

      // Send POST request
      const saveResponse = await axios.post("http://localhost:3001/gatepasses", payload, {
        headers: { "Content-Type": "application/json" },
      })

      if (saveResponse.status === 201) {
        setCreatedGatepass(saveResponse.data)
        setIsSuccessModalOpen(true)
      } else {
        alert("Failed to save gatepass. Please try again.")
      }
    } catch (error) {
      console.error("Error saving gatepass:", error)
      alert("Failed to save gatepass. Please try again.")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              onValueChange={(value) => setValue("department", value)}
              value={user?.department || ""}
              disabled={!!user?.department}
              className="w-full"
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
          <div className="space-y-2">
            <Label>Date & Time Range</Label>
            <DateTimeRangePicker className="w-full" value={null} onChange={(val) => setValue("dateTimeRange", val)} />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" placeholder="Enter destination" {...register("destination")} />
          {errors.destination && <p className="text-red-500 text-sm">{errors.destination.message}</p>}
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="employees">Employees</Label>
          <Combobox
            placeholder="Select employees"
            options={employeeOptions}
            onValueChange={(newValue) => {
              setEmployees(newValue)
              setValue("employees", newValue)
            }}
            value={employees}
          />
          <div className="flex flex-col gap-2 mt-2">
            {employees.map((emp) => (
              <div key={emp} className="flex items-center gap-1 px-2 py-1 rounded">
                {emp} <X className="h-4 w-4 cursor-pointer" onClick={() => removeEmployee(emp)} />
              </div>
            ))}
          </div>
          {errors?.employees && <p className="text-red-500 text-sm">{errors.employees.message}</p>}
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="preparedBy">Prepared by</Label>
          <Combobox
            placeholder="Select preparer"
            options={departmentEmployees}
            onValueChange={(newValue) => {
              if (newValue && newValue.length > 0) {
                setPreparedBy(newValue[0])
                setValue("preparedBy", newValue[0])
              } else {
                setPreparedBy("")
                setValue("preparedBy", "")
              }
            }}
            value={preparedBy ? [preparedBy] : []}
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="assignatory">Assignatory</Label>
          <Combobox
            placeholder="Select assignatory"
            options={departmentEmployees.filter((emp) => emp !== preparedBy)}
            onValueChange={(newValue) => {
              if (newValue && newValue.length > 0) {
                setAssignatory(newValue[0])
                setValue("assignatory", newValue[0])
              } else {
                setAssignatory("")
                setValue("assignatory", "")
              }
            }}
            value={assignatory ? [assignatory] : []}
          />
          <p className="text-xs text-muted-foreground">
            Person from your department who will approve this gatepass (preselected with department manager)
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="purpose">Purpose</Label>
          <Textarea id="purpose" placeholder="Enter purpose" {...register("purpose")} />
          {errors.purpose && <p className="text-red-500 text-sm">{errors.purpose.message}</p>}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate("/gatepass")}>
            Cancel
          </Button>
          <Button type="submit">Create Gatepass</Button>
        </div>

        <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Gatepass Submitted Successfully!</AlertDialogTitle>
            </AlertDialogHeader>
            <p>Your gatepass has been recorded in the system.</p>
            <div className="flex justify-center my-4">
              <Button onClick={() => printGatepass(createdGatepass)} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Gatepass
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleSuccessModalClose}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  )
}

export default GatepassForm
