import type { Slot } from "@/types"

export function getSlotDetails(slotNum: number): Slot {
    const label = `Slot ${slotNum}`

    // Start time: 04:00 AM + (slotNum - 1) * 10 minutes
    const baseHour = 4
    const totalStartMinutes = (slotNum - 1) * 10
    const startHourNum = baseHour + Math.floor(totalStartMinutes / 60)
    const startMinNum = totalStartMinutes % 60

    // End time: 04:00 AM + slotNum * 10 minutes
    const totalEndMinutes = slotNum * 10
    const endHourNum = baseHour + Math.floor(totalEndMinutes / 60)
    const endMinNum = totalEndMinutes % 60

    // Format AM/PM
    const formatTime = (h: number, m: number) => {
        const ampm = h >= 12 ? "PM" : "AM"
        const hr = h % 12 || 12
        return `${hr.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`
    }

    const startTimeStr = formatTime(startHourNum, startMinNum)
    const endTimeStr = formatTime(endHourNum, endMinNum)

    return {
        id: `slot${slotNum}`,
        label,
        time: `${startTimeStr} – ${endTimeStr}`,
    }
}

/** Standard 5-slot layout used across Home, Orders, Search */
export const SLOTS: Slot[] = [
    { id: "slot1", label: "Slot 1", time: "04:00 AM – 04:12 AM" },
    { id: "slot2", label: "Slot 2", time: "05:00 AM – 05:20 AM" },
    { id: "slot3", label: "Slot 3", time: "06:00 AM – 06:30 AM" },
    { id: "slot4", label: "Slot 4", time: "07:00 AM – 07:15 AM" },
    { id: "slot5", label: "Slot 5", time: "08:00 AM – 08:45 AM" },
]

/** Extended 8-slot layout for Finance page */
export const FINANCE_SLOTS: Slot[] = [
    { id: "slot1", label: "Slot 1" },
    { id: "slot2", label: "Slot 2" },
    { id: "slot3", label: "Slot 3" },
    { id: "slot4", label: "Slot 4" },
    { id: "slot5", label: "Slot 5" },
    { id: "slot6", label: "Slot 6" },
    { id: "slot7", label: "Slot 7" },
    { id: "slot8", label: "Slot 8" },
]
