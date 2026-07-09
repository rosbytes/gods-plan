import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createAuthSlice } from "./slices/authSlice"
import { createUiSlice } from "./slices/uiSlice"
import type { StoreState } from "./types"

export const useStore = create<StoreState>()(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createUiSlice(...a),
        }),
        {
            name: "mandi-store",
            // Persist only the authentication state and theme
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                theme: state.theme,
            }),
        },
    ),
)

// Sync across tabs/windows when localStorage changes
if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key === "mandi-store") {
            useStore.persist.rehydrate()
        }
    })
}

export type { StoreState } from "./types"
