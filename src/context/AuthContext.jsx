"use client"

// React and core dependencies
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

// Create context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  // State management
  const [isLogged, setIsLogged] = useState(() => {
    return localStorage.getItem("isLogged") === "true"
  })

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null
  })

  // Effects
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (storedUser) {
      setUser(storedUser)
      setIsLogged(true)
    } else {
      setIsLogged(false)
      setUser(null)
    }
  }, []) // Runs only once on mount

  // Authentication functions
  const login = async (username, password) => {
    try {
      const response = await axios.get("http://localhost:3001/users")
      const users = response.data
      const foundUser = users.find(user => 
        user.username === username && 
        user.password === password
      )

      if (foundUser) {
        const isAdmin = username === "admin" || foundUser.role === "admin"
        const userInfo = {
          id: foundUser.id,
          username: foundUser.username,
          firstName: foundUser.firstName,
          middleName: foundUser.middleName,
          lastName: foundUser.lastName,
          fullName: `${foundUser.firstName} ${foundUser.lastName}`,
          department: foundUser.department,
          position: foundUser.position,
          contactNumber: foundUser.contactNumber,
          gender: foundUser.gender,
          dob: foundUser.dob,
          isAdmin: isAdmin,
        }

        setIsLogged(true)
        setUser(userInfo)
        persistAuthData(userInfo)
        return { login: true, message: "Welcome" }
      } else {
        return getLoginError(users, username, password)
      }
    } catch (error) {
      return { login: false, message: "An unexpected error occurred. Please try again." }
    }
  }

  const logout = (navigate) => {
    clearAuthData()
    navigate("/")
  }

  // Helper functions
  const persistAuthData = (userInfo) => {
    localStorage.setItem("isLogged", "true")
    localStorage.setItem("user", JSON.stringify(userInfo))
  }

  const clearAuthData = () => {
    setIsLogged(false)
    setUser(null)
    localStorage.removeItem("isLogged")
    localStorage.removeItem("user")
  }

  const getLoginError = (users, username, password) => {
    if (!users.find(user => user.username === username)) {
      return { login: false, message: "Account not found. Please check your username." }
    } else if (users.find(user => user.username === username && user.password !== password)) {
      return { login: false, message: "Invalid password. Please try again." }
    }
    return { login: false, message: "An error occurred during login. Please try again." }
  }

  return (
    <AuthContext.Provider value={{ 
      isLogged, 
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
