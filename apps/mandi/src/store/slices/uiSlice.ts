import type { StateCreator } from "zustand"
import type { StoreState, UiSlice } from "../types"

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (set) => ({
    theme: "light",
    sidebarOpen: false,
    setTheme: (theme) => set({ theme }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
})
