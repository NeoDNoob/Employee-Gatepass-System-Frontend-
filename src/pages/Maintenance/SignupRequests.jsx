"use client"

// React and core dependencies
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Context
import { useAuth } from "@/context/AuthContext"

// UI Components
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

//Icons
import { CheckCircle, XCircle, Search, CloudAlert } from "lucide-react"


export function SignupRequests() {
  // Navigation and context
  const navigate = useNavigate()
  const { user } = useAuth()

  // State
  const [pendingSignups, setPendingSignups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSignup, setSelectedSignup] = useState(null)
  const [dialogAction, setDialogAction] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Check if user is an admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/")
    }
  }, [user, navigate])

  // Fetch pending signups
  useEffect(() => {
    const fetchPendingSignups = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("http://localhost:3001/pendingSignups")
        setPendingSignups(response.data || [])
      } catch (error) {
        console.error("Error fetching pending signups:", error)
        setPendingSignups([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingSignups()
  }, [])

  // Handle approve action
  const handleApprove = (signup) => {
    setSelectedSignup(signup)
    setDialogAction("approve")
    setDialogOpen(true)
  }

  // Handle decline action
  const handleDecline = (signup) => {
    setSelectedSignup(signup)
    setDialogAction("decline")
    setDialogOpen(true)
  }

  // Confirm action
  const confirmAction = async () => {
    if (!selectedSignup) return

    try {
      if (dialogAction === "approve") {
        const newUser = {
          ...selectedSignup,
          id: `USER-${Date.now().toString().slice(-6)}`,
        }

        await axios.post("http://localhost:3001/users", newUser)

        const employeeData = {
          id: `EMP-${Date.now().toString().slice(-6)}`,
          firstName: selectedSignup.firstName,
          middleName: selectedSignup.middleName || "",
          lastName: selectedSignup.lastName,
          dob: selectedSignup.dob,
          gender: selectedSignup.gender,
          contactNumber: selectedSignup.contactNumber,
          department: selectedSignup.department,
          position: selectedSignup.position,
        }

        await axios.post("http://localhost:3001/employees", employeeData)
      }

      await axios.delete(`http://localhost:3001/pendingSignups/${selectedSignup.id}`)
      setPendingSignups((prev) => prev.filter((item) => item.id !== selectedSignup.id))
      setDialogOpen(false)
      setSelectedSignup(null)
    } catch (error) {
      console.error("Error processing signup:", error)
      alert("An error occurred while processing the signup request.")
    }
  }

  // Filter signups based on search term
  const filteredSignups = pendingSignups.filter((signup) => {
    const searchString = searchTerm.toLowerCase()
    return (
      signup.firstName?.toLowerCase().includes(searchString) ||
      signup.lastName?.toLowerCase().includes(searchString) ||
      signup.username?.toLowerCase().includes(searchString) ||
      signup.department?.toLowerCase().includes(searchString) ||
      signup.position?.toLowerCase().includes(searchString)
    )
  })




  return (
    <div className="space-y-4">
      <div className="animate-in slide-in-from-top duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Signup Requests</h2>
        <p className="text-muted-foreground">Manage pending signup requests</p>
      </div>

      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search requests..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full overflow-auto rounded-md border animate-in slide-in-from-left duration-500">
        <Table className={"w-full text-sm text-left"}>
          <TableHeader className={"bg-black dark:bg-gray-50"}>
            <TableRow>
              <TableHead className="text-white font-bold w-[200px]">Name</TableHead>
              <TableHead className="text-white font-bold w-[150px]">Username</TableHead>
              <TableHead className="text-white font-bold w-[150px]">Department</TableHead>
              <TableHead className="text-white font-bold w-[150px]">Position</TableHead>
              <TableHead className="text-white font-bold w-[120px]">Contact</TableHead>
              <TableHead className="text-white font-bold w-[100px]">Status</TableHead>
              <TableHead className="text-white font-bold text-center w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSignups.length > 0 ? (
              filteredSignups.map((signup, idx) => (
                <TableRow key={signup.id} className={idx % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : ""}>
                  <TableCell className="font-medium">
                    {signup.firstName} {signup.middleName ? signup.middleName + " " : ""}{signup.lastName}
                  </TableCell>
                  <TableCell>{signup.username}</TableCell>
                  <TableCell>{signup.department}</TableCell>
                  <TableCell>{signup.position}</TableCell>
                  <TableCell>{signup.contactNumber}</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>
                    {/* Actions */}
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(signup)}
                      >
                       
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(signup)}
                      >
                       
                        Decline
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {/* No pending signup requests found */}
                  <div className="flex flex-col items-center justify-center">
                    <CloudAlert className="h-25 w-25 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No pending signup requests found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve" ? "Approve Signup Request" : "Decline Signup Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "approve"
                ? "This will approve the signup request and create a new user account. This action cannot be undone."
                : "This will decline and remove the signup request. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
            >
              {dialogAction === "approve" ? "Approve" : "Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SignupRequests
