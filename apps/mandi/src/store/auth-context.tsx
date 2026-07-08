import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { AuthUser } from "@/types"

const TOKEN_KEY = "mandi_auth_token"

interface AuthContextValue {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        return token ? { token } : null
    })

    // Sync across tabs
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === TOKEN_KEY) {
                setUser(e.newValue ? { token: e.newValue } : null)
            }
        }
        window.addEventListener("storage", onStorage)
        return () => window.removeEventListener("storage", onStorage)
    }, [])

    const login = useCallback((token: string) => {
        localStorage.setItem(TOKEN_KEY, token)
        setUser({ token })
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
    return ctx
}
