"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// Department and position options
const DEPARTMENTS = [
  "Corporate Planning", "CAD", "Marketing", "Finance", 
  "Administration", "Operations and Maintenance", 
  "Internal Audit", "Engineering", "HR", "MSD"
]

const POSITIONS = ["Employee", "Manager", "Administrator"]

// Validation schema
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  contactNumber: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional()
})

export function UserForm({ mode = "add", userId = null, department, gender, position, onClose }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [alert, setAlert] = useState({ message: "", type: "", visible: false })

  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(userSchema)
  })

  // Birthday state for separate year, month, day
  const [year, setYear] = useState(new Date().getFullYear() - 30)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [daysInMonth, setDaysInMonth] = useState([])

  useEffect(() => {
    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
    if (month === 2) {
      const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      days = isLeapYear ? 29 : 28
    }
    setDaysInMonth([...Array(days)].map((_, i) => i + 1))
    if (day > days) setDay(1)
  }, [year, month])

  // Fetch user data for edit mode
  useEffect(() => {
    if (mode === "edit" && userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/users/${userId}`)
          const userData = response.data
          
          // Populate form with existing user data
          Object.keys(userData).forEach(key => {
            setValue(key, userData[key])
          })

          // If userData.dob exists, split and set year, month, day
          if (userData.dob) {
            const [year, month, day] = userData.dob.split('-')
            setYear(Number(year))
            setMonth(Number(month))
            setDay(Number(day))
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }

      fetchUserData()
    }
  }, [mode, userId, setValue])

  // Form submission handler
  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const dob = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      if (mode === "add") {
        await axios.post("http://localhost:3001/users", {
          ...data,
          dob,
          id: `USER-${Date.now()}`,
          status: "Active"
        })
        setAlert({ message: "User added successfully!", type: "success", visible: true })
      } else {
        await axios.put(`http://localhost:3001/users/${userId}`, { ...data, dob })
        setAlert({ message: "User updated successfully!", type: "success", visible: true })
      }
      
      navigate("/users")
    } catch (error) {
      console.error("Error saving user:", error)
      setAlert({ message: "Error saving user. Please try again.", type: "error", visible: true })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const closeAlert = () => {
    setAlert({ ...alert, visible: false })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {alert.visible && (
        <div className={`alert ${alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} p-4 rounded`}>
          <div className="flex justify-between">
            <span>{alert.message}</span>
            <button onClick={closeAlert} className="text-lg font-bold">×</button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Account Information */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input {...register("username")} placeholder="Choose a username" />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
            <div className="space-y-2 relative">
              <Label>Password</Label>
              <Input 
                type={passwordVisible ? "text" : "password"} 
                {...register("password")} 
                placeholder="Set a password" 
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className="absolute right-2 top-10 transform -translate-y-1/2"
              >
                {passwordVisible ? <Eye className="h-4 w-4 bg-muted" /> : <EyeOff className="h-4 w-4 bg-muted" />}
              </button>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
          </div>
        </div>
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 pb-1 border-b border-gray-200">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input {...register("firstName")} placeholder="Enter first name" />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input {...register("lastName")} placeholder="Enter last name" />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input {...register("contactNumber")} placeholder="Enter contact number" />
            </div>
            {/* Birthday field copied from signup page */}
            <div className="space-y-2">
              <Label>Birthdate</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={year.toString()} onValueChange={val => setYear(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 125 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={month.toString()} onValueChange={val => setMonth(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={day.toString()} onValueChange={val => setDay(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysInMonth.map((d) => (
                      <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* End birthday field */}
            <div className="space-y-2 col-span-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={val => setValue("gender", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Employment Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 pb-1 border-b border-gray-200">Employment Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={val => setValue("department", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={position} onValueChange={val => setValue("position", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{mode === "add" ? "Add User" : "Update User"}</Button>
        </div>
      </form>
    </div>
  )
}

export default UserForm;
