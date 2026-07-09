import type { StateCreator } from "zustand"
import type { StoreState, AuthSlice } from "../types"

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set) => ({
    user: null,
    isAuthenticated: false,
    login: (token: string) => {
        set({
            user: { token },
            isAuthenticated: true,
        })
    },
    logout: () => {
        set({
            user: null,
            isAuthenticated: false,
        })
    },
})
