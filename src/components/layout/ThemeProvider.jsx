"use client"

// React and core dependencies
import { createContext, useContext, useEffect, useState } from "react"

// Create a context for theme management
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "ui-theme" }) {
  // State to track the current theme
  const [theme, setTheme] = useState(defaultTheme)
  
  // Effect to initialize theme from localStorage and handle system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey)
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (defaultTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
      
      // Listen for changes in system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => {
        setTheme(e.matches ? "dark" : "light")
      }
      
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [defaultTheme, storageKey])
  
  // Effect to apply theme class to document and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous theme classes
    root.classList.remove("light", "dark")
    
    // Add current theme class
    root.classList.add(theme)
    
    // Save theme to localStorage
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])
  
  // Provide theme context to children
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}

export default ThemeProvider