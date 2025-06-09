"use client"

// React and core dependencies
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

// Icons


// Validation schema
const employeeSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  middleName: z.string().optional(),
  employeeId: z.string().min(1).max(20),
  department: z.string().min(1, "Department is required"),
  year: z.number().min(1900).max(new Date().getFullYear()),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  gender: z.enum(["Male", "Female"]),
  contactNumber: z
    .string()
    .min(10)
    .max(11)
    .regex(/^\d{10,11}$/, "Invalid Contact Number"),
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
]

export function EmployeeForm({ mode = "add", employeeId = null }) {
  // Hooks and state
  const navigate = useNavigate()
  const [daysInMonth, setDaysInMonth] = useState([])
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
  })

  const year = watch("year")
  const month = watch("month")
  const day = watch("day")

  // Fetch employee data for edit mode
  useEffect(() => {
    if (mode === "edit" && employeeId) {
      const fetchEmployeeData = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/employees/${employeeId}`)
          const employeeData = response.data
          
          // Populate form with existing employee data
          setValue("firstName", employeeData.firstName)
          setValue("lastName", employeeData.lastName)
          setValue("middleName", employeeData.middleName || "")
          setValue("employeeId", employeeData.id)
          
          // Explicitly set department using setValue
          setValue("department", employeeData.department)
          
          setValue("contactNumber", employeeData.contactNumber)
          setValue("gender", employeeData.gender)

          // Parse DOB
          if (employeeData.dob) {
            const [dobYear, dobMonth, dobDay] = employeeData.dob.split('-')
            
            // Set year, month, and day using setValue
            setValue("year", Number(dobYear))
            setValue("month", Number(dobMonth))
            setValue("day", Number(dobDay))
          }
        } catch (error) {
          console.error("Error fetching employee data:", error)
          alert("Failed to load employee data.")
        }
      }

      fetchEmployeeData()
    }
  }, [mode, employeeId, setValue])

  // Helper functions
  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
    navigate("/employees")
  }

  // Effects
  useEffect(() => {
    if (!year || !month) return

    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
    if (month === 2) {
      const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      days = isLeapYear ? 29 : 28
    }

    setDaysInMonth([...Array(days)].map((_, i) => i + 1))
    
    // Ensure day is within valid range
    if (day && day > days) {
      setValue("day", days)
    }
  }, [year, month, day, setValue])

  // Event handlers
  const onSubmit = async (data, event) => {
    event?.preventDefault()

    try {
      const dob = `${data.year}-${String(data.month).padStart(2, "0")}-${String(data.day).padStart(2, "0")}`
      const payload = {
        id: data.employeeId.trim(),
        firstName: data.firstName,
        middleName: data.middleName || "",
        lastName: data.lastName,
        dob: dob,
        gender: data.gender,
        contactNumber: data.contactNumber,
        department: data.department,
      }

      if (mode === "add") {
        const saveResponse = await axios.post("http://localhost:3001/employees", payload, {
          headers: { "Content-Type": "application/json" },
        })

        if (saveResponse.status === 201) {
          setIsSuccessModalOpen(true)
        } else {
          alert("Failed to save employee.")
        }
      } else {
        const updateResponse = await axios.put(`http://localhost:3001/employees/${employeeId}`, payload, {
          headers: { "Content-Type": "application/json" },
        })

        if (updateResponse.status === 200) {
          navigate("/employees")
        } else {
          alert("Failed to update employee.")
        }
      }
    } catch (error) {
      console.error("Error Details:", error.message)
      alert(`Failed to ${mode === "add" ? "save" : "update"} employee: ${error.message}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in duration-500">
     

      <div className="grid grid-cols-2 gap-6">
        {/* First Name */}
        <div className="col-span-1">
          <Label className={"mb-2"}>First Name</Label>
          <Input {...register("firstName")} placeholder="Juan" />
          {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div className="col-span-1">
          <Label className={"mb-2"}>Last Name</Label>
          <Input {...register("lastName")} placeholder="Dela Cruz" />
          {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
        </div>

        {/* Middle Name */}
        <div className="col-span-2">
          <Label className={"mb-2"}>Middle Name (Optional)</Label>
          <Input {...register("middleName")} placeholder="Optional" />
        </div>

        {/* Employee ID */}
        <div className="col-span-1">
          <Label className={"mb-2"}>Employee ID</Label>
          <Input {...register("employeeId")} placeholder="EMP-12345" />
          {errors.employeeId && <p className="text-red-500">{errors.employeeId.message}</p>}
        </div>

        {/* Department */}
        <div className="col-span-1">
          <Label className={"mb-2"}>Department</Label>
          <Select 
            value={watch("department") || ""} 
            onValueChange={(val) => setValue("department", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department">
                {watch("department") || "Select Department"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-red-500">{errors.department.message}</p>}
        </div>

        {/* Birthdate */}
        <div className="col-span-2">
          <Label className={"mb-2"}>Birthdate</Label>
          <div className="flex gap-2">
            <Select 
              value={watch("year")?.toString() || ""} 
              onValueChange={(val) => setValue("year", Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year">
                  {watch("year") || "Year"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 125 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={watch("month")?.toString() || ""} 
              onValueChange={(val) => setValue("month", Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Month">
                  {watch("month") || "Month"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={watch("day")?.toString() || ""} 
              onValueChange={(val) => setValue("day", Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Day">
                  {watch("day") || "Day"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {daysInMonth.map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gender */}
        <div className="col-span-1">
          <Label className={"mb-2"}>Gender</Label>
          <Select 
            value={watch("gender") || ""} 
            onValueChange={(val) => setValue("gender", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender">
                {watch("gender") || "Select Gender"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Number */}
        <div className="col-span-1">
          <Label className={"mb-2"}>Contact Number</Label>
          <Input {...register("contactNumber")} placeholder="09123456789" />
          {errors.contactNumber && <p className="text-red-500">{errors.contactNumber.message}</p>}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={() => reset()} 
          type="button" 
          variant="outline" 
          className={"mt-5"}
         
        >
          Reset
        </Button>
        <Button type="submit" className={"mt-5"}>
          {mode === "add" ? "Submit" : "Update"}
        </Button>
      </div>

      <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Employee Added Successfully!</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Employee successfully added to the system.</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessModalClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

export default EmployeeForm
