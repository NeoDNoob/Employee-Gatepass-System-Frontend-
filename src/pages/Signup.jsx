"use client"

// React and core dependencies
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

// Icons
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"



export function Signup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [daysInMonth, setDaysInMonth] = useState([])
  const [showDialog, setShowDialog] = useState(false)

  // Department options
  const departmentOptions = [
    "Corporate Planning",
    "CAD",
    "Marketing",
    "Finance",
    "Administration",
    "Operations and Maintenance",
    "Internal Audit",
    "Engineering"
  ]

  // Form data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
    gender: "Male",
    contactNumber: "",
    department: "",
    position: "Employee",
  })

  useEffect(() => {
    if (!formData.year || !formData.month) return
    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][formData.month - 1]
    if (formData.month === 2) {
      const isLeapYear = formData.year % 4 === 0 && (formData.year % 100 !== 0 || formData.year % 400 === 0)
      days = isLeapYear ? 29 : 28
    }
    setDaysInMonth([...Array(days)].map((_, i) => i + 1))
    if (formData.day > days) setFormData((prev) => ({ ...prev, day: 1 }))
  }, [formData.year, formData.month])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const testServerConnection = async () => {
      try {
        await axios.get("http://localhost:3001/users", { timeout: 5000 })
      } catch (error) {
        setError("Server connection test failed. Please make sure the JSON server is running on port 3001.")
      }
    }
    testServerConnection()
  }, [])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const usersResponse = await axios.get("http://localhost:3001/users")
      const existingUser = usersResponse.data.find((user) => user.username === formData.username)

      if (existingUser) {
        setError("Username already exists. Please choose another username.")
        setLoading(false)
        return
      }

      const dob = `${formData.year}-${String(formData.month).padStart(2, "0")}-${String(formData.day).padStart(2, "0")}`

      const signupPayload = {
        id: `PENDING-${Date.now()}`,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        middleName: formData.middleName || "",
        lastName: formData.lastName,
        dob,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        department: formData.department,
        position: formData.position,
        status: "Pending",
        createdAt: new Date().toISOString(),
      }

      try {
        await axios.get("http://localhost:3001/pendingSignups")
      } catch {
        try {
          const dbResponse = await axios.get("http://localhost:3001/db")
          const db = dbResponse.data
          if (!db.pendingSignups) db.pendingSignups = []
          db.pendingSignups.push(signupPayload)
          await axios.put("http://localhost:3001/db", db)
          setShowDialog(true)
          return
        } catch (dbErr) {
          setError("Failed to create signup request. Database update error.")
          setLoading(false)
          return
        }
      }

      await axios.post("http://localhost:3001/pendingSignups", signupPayload)
      setShowDialog(true)
    } catch (err) {
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data.message || "Unknown error"}`)
      } else if (err.request) {
        setError("No response from server. Please check your connection and make sure JSON server is running.")
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-3xl px-4">
        <div className="flex flex-col items-center mb-6 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-2">
            <img src="/src/assets/LOGO.svg" alt="Quezelco Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-3xl font-bold">CREATE ACCOUNT</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Your account will need to be approved by a manager before you can log in
          </p>
        </div>

        <Card className="w-full shadow-lg border-0 animate-in fade-in duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-center">Sign Up Form</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium mb-3 pb-1 border-b border-gray-200">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium mb-3 pb-1 border-b border-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="middleName">Middle Name (Optional)</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Enter middle name (optional)"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label>Birthdate</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={formData.year.toString()}
                        onValueChange={(val) => handleSelectChange("year", Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
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
                        value={formData.month.toString()}
                        onValueChange={(val) => handleSelectChange("month", Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
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
                        value={formData.day.toString()}
                        onValueChange={(val) => handleSelectChange("day", Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
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

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="e.g., 09123456789"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-medium mb-3 pb-1 border-b border-gray-200">Employment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formData.department} onValueChange={(val) => handleSelectChange("department", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

              <div className="flex flex-col md:flex-row justify-between gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 hover:bg-gray-200"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 hover:bg-gray-900 hover:text-white"
                >
                  {loading && <Loader2 className="animate-spin h-4 w-4" />}
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Signup Submitted</AlertDialogTitle>
              <AlertDialogDescription>
                Your signup request has been submitted and is pending approval by a manager.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => navigate("/")}>Back to Login</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default Signup
