import type { AuthUser } from "@/types"

export interface AuthSlice {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (token: string) => void
    logout: () => void
}

export interface UiSlice {
    theme: "light" | "dark"
    sidebarOpen: boolean
    setTheme: (theme: "light" | "dark") => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
}

export type StoreState = AuthSlice & UiSlice
