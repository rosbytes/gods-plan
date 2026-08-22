import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import type { AdminUserItem } from "../types"
import { toast } from "sonner"
import { AdminLayout } from "../components/layout"
import {
    Button,
    Input,
    Modal,
    Badge,
    EmptyState,
    PlusIcon,
    EditIcon,
    TrashIcon,
    SearchIcon,
    SpinnerIcon,
    BackIcon,
} from "../components/ui"
import { PhoneInput } from "@ros/ui"

type RoleFilter = "all" | "admin" | "super_admin" | "operator"

export default function ManageAdmins() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedRole, setSelectedRole] = useState<RoleFilter>("all")

    // Current logged-in admin profile
    const { data: me } = trpc.auth.me.useQuery(undefined, { staleTime: 5 * 60 * 1000 })

    // Form state
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [pin, setPin] = useState("")
    const [role, setRole] = useState<"admin" | "super_admin" | "operator">("admin")

    const { data: adminUsers, isLoading, refetch } = trpc.adminUser.list.useQuery({})

    // Edit state
    const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editPhone, setEditPhone] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editPin, setEditPin] = useState("")
    const [editRole, setEditRole] = useState<"admin" | "super_admin" | "operator">("admin")
    const [editIsActive, setEditIsActive] = useState(true)

    // Delete state
    const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null)

    const createMutation = trpc.adminUser.create.useMutation({
        onSuccess: () => {
            setName("")
            setPhone("")
            setEmail("")
            setPin("")
            setRole("admin")
            setShowForm(false)
            toast.success("Team member added successfully")
            refetch()
        },
        onError: (e) => toast.error(e.message),
    })

    const updateMutation = trpc.adminUser.update.useMutation({
        onSuccess: () => {
            setEditingUser(null)
            toast.success("Team member updated successfully")
            refetch()
        },
        onError: (e) => toast.error(e.message),
    })

    const deleteMutation = trpc.adminUser.delete.useMutation({
        onSuccess: () => {
            setDeletingUser(null)
            toast.success("Team member removed successfully")
            refetch()
        },
        onError: (e) => toast.error(e.message),
    })

    const filteredUsers = useMemo(() => {
        if (!adminUsers?.items) return []
        let list = adminUsers.items
        if (selectedRole !== "all") {
            list = list.filter((u) => u.role === selectedRole)
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            list = list.filter(
                (u) =>
                    u.name.toLowerCase().includes(query) ||
                    u.phone.toLowerCase().includes(query) ||
                    (u.email && u.email.toLowerCase().includes(query)),
            )
        }
        return list
    }, [adminUsers, selectedRole, searchQuery])

    const totalCount = adminUsers?.items?.length ?? 0
    const superAdminCount = adminUsers?.items?.filter((u) => u.role === "super_admin").length ?? 0
    const adminCount = adminUsers?.items?.filter((u) => u.role === "admin").length ?? 0
    const operatorCount = adminUsers?.items?.filter((u) => u.role === "operator").length ?? 0

    const handleSubmit = async () => {
        createMutation.mutate({
            name,
            phone,
            email: email || undefined,
            pin,
            role,
        })
    }

    const handleEdit = (u: AdminUserItem) => {
        setEditingUser(u)
        setEditName(u.name)
        setEditPhone(u.phone)
        setEditEmail(u.email || "")
        setEditPin("")
        setEditRole(u.role as "admin" | "super_admin" | "operator")
        setEditIsActive(u.isActive)
    }

    const handleUpdate = async () => {
        if (!editingUser) return

        updateMutation.mutate({
            id: editingUser.id,
            name: editName !== editingUser.name ? editName : undefined,
            phone: editPhone !== editingUser.phone ? editPhone : undefined,
            email: editEmail !== (editingUser.email || "") ? editEmail || undefined : undefined,
            pin: editPin ? editPin : undefined,
            role: editRole !== editingUser.role ? editRole : undefined,
            isActive: editIsActive !== editingUser.isActive ? editIsActive : undefined,
        })
    }

    const handleDeleteConfirm = () => {
        if (deletingUser) {
            deleteMutation.mutate({ id: deletingUser.id })
        }
    }

    const isFormValid = name.trim() !== "" && phone.length >= 10 && pin.length === 4
    const isEditValid = editName.trim() !== "" && editPhone.length >= 10
    const isPending = createMutation.isPending || updateMutation.isPending

    const getRoleBadgeVariant = (roleName: string) => {
        switch (roleName) {
            case "super_admin":
                return "warning"
            case "admin":
                return "success"
            case "operator":
                return "info"
            default:
                return "neutral"
        }
    }

    const getRoleLabel = (roleName: string) => {
        switch (roleName) {
            case "super_admin":
                return "Super Admin 👑"
            case "admin":
                return "Admin 🛡️"
            case "operator":
                return "Operator 👷"
            default:
                return roleName
        }
    }

    return (
        <>
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={Boolean(deletingUser)}
                onClose={() => setDeletingUser(null)}
                title="Confirm Member Deletion"
                subtitle="Are you sure you want to remove this team member?"
            >
                <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-600">
                        This action will permanently delete{" "}
                        <strong className="text-gray-900">{deletingUser?.name}</strong> (
                        {deletingUser?.phone}) from portal access.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" fullWidth onClick={() => setDeletingUser(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            isLoading={deleteMutation.isPending}
                            onClick={handleDeleteConfirm}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* MOBILE VIEW (< 1024px) — 100% PRESERVED ORIGINAL MOBILE DESIGN            */}
            {/* ========================================================================= */}
            <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900 lg:hidden">
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 pt-12 pb-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                        >
                            <BackIcon size={22} />
                        </button>
                        <h1 className="text-[18px] font-bold tracking-tight">
                            Manage Team & Admins
                        </h1>
                    </div>

                    <div className="mt-2 flex-1 space-y-5 px-5">
                        {/* Create Form Toggle */}
                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-semibold text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]"
                            >
                                <PlusIcon size={20} />
                                Add Admin or Operator
                            </button>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-xs">
                                <div className="bg-[#135B47] px-5 py-3.5">
                                    <h2 className="text-[15px] font-semibold text-white">
                                        New Team Member
                                    </h2>
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul Sharma"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <PhoneInput
                                        label="Phone Number *"
                                        placeholder="Enter mobile number"
                                        value={phone}
                                        onChange={(val, meta) => setPhone(meta.e164 || val)}
                                        defaultCountry="IN"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. rahul@ros.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        4-Digit Secret PIN *
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        placeholder="e.g. 1234"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Role Assignment *
                                    </label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as any)}
                                        className="w-full cursor-pointer appearance-none bg-transparent text-[16px] font-semibold text-gray-800 focus:outline-none"
                                    >
                                        <option value="admin">Admin 🛡️</option>
                                        <option value="operator">Operator 👷</option>
                                        <option value="super_admin">Super Admin 👑</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 px-5 py-4">
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 cursor-pointer rounded-xl bg-gray-100 py-3 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isFormValid || isPending}
                                        className="flex-1 cursor-pointer rounded-xl bg-[#135B47] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                                    >
                                        {isPending ? "Saving..." : "Add Member"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List Header */}
                        <div>
                            <p className="mb-3 text-[14px] font-semibold text-gray-500">
                                Team Members {adminUsers?.items && `(${adminUsers.items.length})`}
                            </p>

                            {isLoading ? (
                                <div className="mt-10 flex justify-center text-gray-400">
                                    Loading...
                                </div>
                            ) : adminUsers?.items?.length === 0 ? (
                                <div className="mt-10 text-center text-sm text-gray-400">
                                    No team members registered yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {adminUsers?.items?.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E8F3F0] text-base font-bold text-[#135B47]">
                                                {u.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-1 flex-col truncate">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-[16px] font-bold tracking-tight text-gray-800">
                                                        {u.name}
                                                    </span>
                                                    {me?.id === u.id && (
                                                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="mt-0.5 truncate text-[13px] font-medium text-gray-400">
                                                    {u.phone} {u.email ? `• ${u.email}` : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant={getRoleBadgeVariant(u.role)}>
                                                    {u.role}
                                                </Badge>
                                                <button
                                                    onClick={() => handleEdit(u as AdminUserItem)}
                                                    className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                                >
                                                    <EditIcon size={18} />
                                                </button>
                                                {me?.id !== u.id && (
                                                    <button
                                                        onClick={() =>
                                                            setDeletingUser(u as AdminUserItem)
                                                        }
                                                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP VIEW (>= 1024px) — ELEVATED DESKTOP DASHBOARD                      */}
            {/* ========================================================================= */}
            <div className="hidden lg:block">
                <AdminLayout
                    title="Team & Permissions"
                    subtitle="Manage platform administrators, operators, and role-based access"
                >
                    {/* Create Admin Modal */}
                    <Modal
                        isOpen={showForm}
                        onClose={() => setShowForm(false)}
                        title="Add Team Member"
                        subtitle="Grant access to a new administrator or operator"
                    >
                        <div className="space-y-4">
                            <Input
                                label="Full Name *"
                                placeholder="e.g. Rahul Sharma"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <PhoneInput
                                label="Phone Number *"
                                placeholder="Enter mobile number"
                                value={phone}
                                onChange={(val, meta) => setPhone(meta.e164 || val)}
                                defaultCountry="IN"
                            />
                            <Input
                                label="Email Address (Optional)"
                                type="email"
                                placeholder="e.g. rahul@ros.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                label="4-Digit Secret PIN *"
                                type="password"
                                maxLength={4}
                                placeholder="4-digit security PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    Role Assignment *
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                >
                                    <option value="admin">Admin 🛡️ — Full management access</option>
                                    <option value="operator">
                                        Operator 👷 — Operational field access
                                    </option>
                                    <option value="super_admin">
                                        Super Admin 👑 — System wide authority
                                    </option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    isLoading={isPending}
                                    disabled={!isFormValid}
                                    onClick={handleSubmit}
                                >
                                    Add Member
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Edit Admin Modal */}
                    <Modal
                        isOpen={Boolean(editingUser)}
                        onClose={() => setEditingUser(null)}
                        title="Edit Member Profile"
                        subtitle="Update role, contact info, or status"
                    >
                        <div className="space-y-4">
                            <Input
                                label="Full Name *"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <PhoneInput
                                label="Phone Number *"
                                value={editPhone}
                                onChange={(val, meta) => setEditPhone(meta.e164 || val)}
                                defaultCountry="IN"
                            />
                            <Input
                                label="Email Address"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />
                            <Input
                                label="Reset 4-Digit PIN (Optional)"
                                type="password"
                                maxLength={4}
                                placeholder="Leave blank to keep unchanged"
                                value={editPin}
                                onChange={(e) => setEditPin(e.target.value)}
                            />
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    Role Assignment
                                </label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as any)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                >
                                    <option value="admin">Admin 🛡️</option>
                                    <option value="operator">Operator 👷</option>
                                    <option value="super_admin">Super Admin 👑</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editIsActive}
                                    onChange={(e) => setEditIsActive(e.target.checked)}
                                    className="h-4 w-4 rounded-md text-[#135B47] focus:ring-[#135B47]"
                                />
                                <label
                                    htmlFor="isActive"
                                    className="cursor-pointer text-xs font-semibold text-gray-700"
                                >
                                    Account Active & Enabled
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    isLoading={isPending}
                                    disabled={!isEditValid}
                                    onClick={handleUpdate}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Team Metrics Summary Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                Total Team
                            </span>
                            <div className="mt-2 text-2xl font-black text-gray-900">
                                {totalCount}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
                                Administrators
                            </span>
                            <div className="mt-2 text-2xl font-black text-emerald-700">
                                {adminCount}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                                Operators
                            </span>
                            <div className="mt-2 text-2xl font-black text-blue-700">
                                {operatorCount}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-semibold tracking-wider text-purple-600 uppercase">
                                Super Admins
                            </span>
                            <div className="mt-2 text-2xl font-black text-purple-700">
                                {superAdminCount}
                            </div>
                        </div>
                    </div>

                    {/* Toolbar Banner */}
                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Team Directory</h2>
                                <p className="text-xs font-medium text-gray-400">
                                    Authorized portal accounts and credentials
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Bar */}
                                <div className="relative min-w-55">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <SearchIcon size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 text-xs font-medium text-gray-800 transition-colors placeholder:text-gray-400 focus:border-[#135B47] focus:bg-white focus:outline-none"
                                        placeholder="Search name, phone or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Role Tabs */}
                                <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs font-semibold text-gray-600">
                                    <button
                                        onClick={() => setSelectedRole("all")}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                                            selectedRole === "all"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                    >
                                        All ({totalCount})
                                    </button>
                                    <button
                                        onClick={() => setSelectedRole("admin")}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                                            selectedRole === "admin"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                    >
                                        Admin ({adminCount})
                                    </button>
                                    <button
                                        onClick={() => setSelectedRole("operator")}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                                            selectedRole === "operator"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                    >
                                        Operator ({operatorCount})
                                    </button>
                                </div>

                                <Button
                                    variant="primary"
                                    size="md"
                                    icon={<PlusIcon size={18} />}
                                    onClick={() => setShowForm(true)}
                                >
                                    Add Member
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    {isLoading ? (
                        <div className="flex justify-center py-16 text-gray-400">
                            <SpinnerIcon size={28} className="text-[#135B47]" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <EmptyState
                            title="No Team Members Found"
                            description={
                                searchQuery
                                    ? `No member matching "${searchQuery}"`
                                    : "Click below to add your first team member."
                            }
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<PlusIcon size={16} />}
                                    onClick={() => setShowForm(true)}
                                >
                                    Add Member
                                </Button>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xs">
                            <table className="w-full text-left text-xs font-medium text-gray-600">
                                <thead className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-5 py-4">Member Name</th>
                                        <th className="px-5 py-4">Role</th>
                                        <th className="px-5 py-4">Contact Phone</th>
                                        <th className="px-5 py-4">Email</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="transition-colors hover:bg-gray-50/50"
                                        >
                                            <td className="px-5 py-4 font-bold text-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-[#135B47]">
                                                        {u.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span>{u.name}</span>
                                                            {me?.id === u.id && (
                                                                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge variant={getRoleBadgeVariant(u.role)}>
                                                    {getRoleLabel(u.role)}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-gray-700">
                                                {u.phone}
                                            </td>
                                            <td className="px-5 py-4 text-gray-500">
                                                {u.email || "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                {u.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                                        Disabled
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(u as AdminUserItem)
                                                        }
                                                        className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                                        title="Edit user"
                                                    >
                                                        <EditIcon size={18} />
                                                    </button>
                                                    {me?.id !== u.id && (
                                                        <button
                                                            onClick={() =>
                                                                setDeletingUser(u as AdminUserItem)
                                                            }
                                                            className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Delete user"
                                                        >
                                                            <TrashIcon size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminLayout>
            </div>
        </>
    )
}
