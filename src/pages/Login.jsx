"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Icons
import { Eye, EyeOff, Loader2 } from "lucide-react"

// Context
import { useAuth } from "@/context/AuthContext"


export function Login() {
  const { login, isLogged } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    showPassword: false,
    error: "",
    loading: false,
  })

  useEffect(() => {
    if (isLogged) {
      navigate("/dashboard")
    }
  }, [isLogged, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormData(prev => ({ ...prev, loading: true, error: "" }))

    try {
      const result = await login(formData.username, formData.password)
      if (result?.login) {
        navigate("/dashboard")
      } else {
        setFormData(prev => ({ ...prev, error: result?.message || "Invalid credentials" }))
      }
    } catch (err) {
      setFormData(prev => ({ ...prev, error: "Something went wrong. Please try again." }))
    } finally {
      setFormData(prev => ({ ...prev, loading: false }))
    }
  }

  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 animate-in fade-in duration-500">
      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-2">
            <img src="/src/assets/LOGO.svg" alt="Quezelco Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-3xl font-bold">AUTHENTICATE</h1>
          </div>
          <p className="text-muted-foreground text-center">Sign in to access the Employee Gatepass System</p>
        </div>

        <Card className="w-full shadow-lg border-0 animate-in fade-in duration-500">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={formData.showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {formData.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formData.error && (
                  <div className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-md animate-in fade-in duration-500">
                    {formData.error}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-10 animate-in fade-in duration-500 hover:bg-gray-900 hover:text-white" disabled={formData.loading}>
                {formData.loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                {formData.loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-sm text-center">
                <a href="/forgot-password" className="text-blue-500 hover:text-blue-700 font-medium hover:underline">
                  Forgot password?
                </a>
              </p>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <p className="text-sm text-center">
              Don't have an account yet?{" "}
              <a href="/signup" className="text-blue-500 hover:text-blue-700 font-medium hover:underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
