import { useState } from "react"
import { Icon } from "@iconify/react"
import { Button, Input, PhoneInput, Spinner, toast, Toaster, type PhoneInputMeta } from "../src"

type NavSection = "getting-started" | "phone-input" | "button" | "input" | "spinner" | "toast"

export default function App() {
    const [activeSection, setActiveSection] = useState<NavSection>("phone-input")
    const [searchQuery, setSearchQuery] = useState("")
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

    // Viewport sizes for preview frames
    const [viewportWidth, setViewportWidth] = useState<"full" | "tablet" | "mobile">("full")

    // PhoneInput state & props controls
    const [phoneVal, setPhoneVal] = useState("+919876543210")
    const [phoneMeta, setPhoneMeta] = useState<PhoneInputMeta | null>(null)
    const [phoneDisabled, setPhoneDisabled] = useState(false)
    const [phoneCustomError, setPhoneCustomError] = useState("")

    // Button state & props controls
    const [btnLoading, setBtnLoading] = useState(false)

    // Input state & props controls
    const [inputVal, setInputVal] = useState("")
    const [inputError, setInputError] = useState("")

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedSnippet(id)
        toast.success("Code snippet copied to clipboard!")
        setTimeout(() => setCopiedSnippet(null), 2000)
    }

    const navigationItems = [
        {
            category: "Getting Started",
            items: [{ id: "getting-started", label: "Overview & Setup", icon: "lucide:book-open" }],
        },
        {
            category: "Form & Input Controls",
            items: [
                { id: "phone-input", label: "PhoneInput", icon: "lucide:phone", badge: "Core" },
                { id: "button", label: "Button", icon: "lucide:mouse-pointer" },
                { id: "input", label: "Input", icon: "lucide:text-cursor-input" },
            ],
        },
        {
            category: "Feedback & Status",
            items: [
                { id: "spinner", label: "Spinner", icon: "lucide:loader-2" },
                { id: "toast", label: "Sonner Toasts", icon: "lucide:bell" },
            ],
        },
    ]

    const filteredNavGroups = navigationItems.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase().trim()),
        ),
    }))

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans text-gray-900 antialiased">
            <Toaster position="top-right" richColors />

            {/* Header / Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 px-6 py-3.5 shadow-2xs backdrop-blur-md">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#0B4E3E] to-[#135B47] text-sm font-bold text-white shadow-xs">
                                ROS
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold tracking-tight text-gray-900">
                                        @ros/ui
                                    </span>
                                    <span className="rounded-full border border-emerald-200/60 bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                        v0.1.0
                                    </span>
                                </div>
                                <p className="hidden text-[11px] font-medium text-gray-500 sm:block">
                                    Official Design System & Component Library
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Search & Install Snippet */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => copyCode("pnpm add @ros/ui", "pkg-install")}
                            className="hidden cursor-pointer items-center gap-2 rounded-lg border border-gray-200/60 bg-gray-100 px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:bg-gray-200/80 md:flex"
                            title="Copy install command"
                        >
                            <span>$ pnpm add @ros/ui</span>
                            <Icon
                                icon={
                                    copiedSnippet === "pkg-install" ? "lucide:check" : "lucide:copy"
                                }
                                className={`h-3.5 w-3.5 ${copiedSnippet === "pkg-install" ? "text-emerald-600" : "text-gray-400"}`}
                            />
                        </button>

                        <div className="relative">
                            <Icon
                                icon="lucide:search"
                                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search components..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-44 rounded-lg border border-gray-200 bg-gray-100/80 py-1.5 pr-3 pl-9 text-xs text-gray-800 transition-all focus:bg-white focus:ring-1 focus:ring-[#0B4E3E] focus:outline-none sm:w-64"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-[1600px] flex-1">
                {/* Left Sidebar Navigation */}
                <aside className="sticky top-16.25 hidden max-h-[calc(100vh-65px)] w-64 shrink-0 overflow-y-auto border-r border-gray-200/80 bg-white p-6 lg:block">
                    <div className="space-y-8">
                        {filteredNavGroups.map((group, idx) => (
                            <div key={idx}>
                                {group.items.length > 0 && (
                                    <>
                                        <h3 className="mb-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                                            {group.category}
                                        </h3>
                                        <div className="space-y-1">
                                            {group.items.map((item) => {
                                                const isActive = activeSection === item.id
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() =>
                                                            setActiveSection(item.id as NavSection)
                                                        }
                                                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                                                            isActive
                                                                ? "bg-[#0B4E3E] text-white shadow-xs"
                                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <Icon
                                                                icon={item.icon}
                                                                className="h-4 w-4 shrink-0"
                                                            />
                                                            <span>{item.label}</span>
                                                        </div>
                                                        {item.badge && (
                                                            <span
                                                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                                                    isActive
                                                                        ? "bg-white/20 text-white"
                                                                        : "bg-emerald-100 text-emerald-800"
                                                                }`}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="max-w-full flex-1 overflow-x-hidden p-6 md:p-10">
                    {/* Viewport Frame Size Switcher Toolbar */}
                    <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">
                                Preview Canvas Viewport:
                            </span>
                            <div className="inline-flex rounded-xl bg-gray-200/70 p-1">
                                {[
                                    { id: "full", label: "Desktop (100%)", icon: "lucide:monitor" },
                                    {
                                        id: "tablet",
                                        label: "Tablet (768px)",
                                        icon: "lucide:tablet",
                                    },
                                    {
                                        id: "mobile",
                                        label: "Mobile (375px)",
                                        icon: "lucide:smartphone",
                                    },
                                ].map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() =>
                                            setViewportWidth(v.id as "full" | "tablet" | "mobile")
                                        }
                                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                            viewportWidth === v.id
                                                ? "bg-white text-gray-900 shadow-xs"
                                                : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        <Icon icon={v.icon} className="h-3.5 w-3.5" />
                                        <span>{v.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Section: Getting Started */}
                        {activeSection === "getting-started" && (
                            <div className="max-w-4xl space-y-8">
                                <div>
                                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
                                        Getting Started with @ros/ui
                                    </h1>
                                    <p className="text-base leading-relaxed text-gray-600">
                                        The official reusable component library for ROS monorepo
                                        applications (`apps/admin`, `apps/mandi`, `apps/www`,
                                        `apps/info`). Built with React 19, TypeScript, Tailwind CSS
                                        v4, Iconify, and Sonner.
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-2xs">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Installation & Setup
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Add{" "}
                                        <code className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-700">
                                            @ros/ui
                                        </code>{" "}
                                        to your workspace{" "}
                                        <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-700">
                                            package.json
                                        </code>
                                        :
                                    </p>
                                    <div className="relative rounded-xl bg-gray-900 p-4 font-mono text-xs text-gray-100">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyCode(
                                                    "pnpm --filter @ros/admin add @ros/ui",
                                                    "install-guide",
                                                )
                                            }
                                            className="absolute top-3 right-3 text-gray-400 transition-colors hover:text-white"
                                        >
                                            <Icon
                                                icon={
                                                    copiedSnippet === "install-guide"
                                                        ? "lucide:check"
                                                        : "lucide:copy"
                                                }
                                                className="h-4 w-4"
                                            />
                                        </button>

                                        <pre className="font-mono text-emerald-400">
                                            <code>pnpm --filter @ros/admin add @ros/ui</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: PhoneInput Component */}
                        {activeSection === "phone-input" && (
                            <div className="space-y-10">
                                {/* Component Header */}
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                                            PhoneInput
                                        </h1>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                            Core Form Component
                                        </span>
                                    </div>
                                    <p className="text-base text-gray-600">
                                        International phone number input with vector country flags
                                        (Iconify), searchable country selector, auto country code
                                        detection, and live libphonenumber-js validation.
                                    </p>
                                </div>

                                {/* Live Interactive Preview Canvas Frame */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                                        Live Interactive Component Preview
                                    </h3>

                                    <div
                                        className={`mx-auto transition-all duration-300 ${
                                            viewportWidth === "mobile"
                                                ? "max-w-93.75"
                                                : viewportWidth === "tablet"
                                                  ? "max-w-3xl"
                                                  : "w-full"
                                        }`}
                                    >
                                        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
                                            {/* Canvas Banner */}
                                            <div className="flex items-center justify-between border-b border-gray-200/70 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                                </span>
                                                <span>Canvas Output Frame</span>
                                            </div>

                                            {/* Canvas Body */}
                                            <div className="bg-grid-pattern flex min-h-55 items-center justify-center bg-gray-50/30 p-8">
                                                <div className="w-full max-w-md">
                                                    <PhoneInput
                                                        label="Vendor Mobile Number"
                                                        defaultCountry="IN"
                                                        value={phoneVal}
                                                        disabled={phoneDisabled}
                                                        error={phoneCustomError}
                                                        onChange={(val, meta) => {
                                                            setPhoneVal(val)
                                                            setPhoneMeta(meta)
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Live Metadata & Controls Footer */}
                                            <div className="grid grid-cols-1 gap-4 border-t border-gray-800 bg-gray-900 p-5 font-mono text-xs text-gray-100 md:grid-cols-2">
                                                <div>
                                                    <span className="mb-2 block font-bold text-teal-400">
                                                        Live Output Metadata:
                                                    </span>
                                                    <div className="space-y-1 text-gray-300">
                                                        <div>
                                                            Valid Status:{" "}
                                                            <span
                                                                className={
                                                                    phoneMeta?.isValid
                                                                        ? "font-bold text-emerald-400"
                                                                        : "font-bold text-amber-400"
                                                                }
                                                            >
                                                                {phoneMeta?.isValid
                                                                    ? "✓ TRUE"
                                                                    : "✗ FALSE"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            Country:{" "}
                                                            <span className="font-bold text-white">
                                                                {phoneMeta?.country || "IN"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            E.164 String:{" "}
                                                            <span className="text-yellow-300">
                                                                {phoneMeta?.e164 || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 border-t border-gray-800 pt-3 font-sans md:border-t-0 md:border-l md:pt-0 md:pl-4">
                                                    <span className="block text-xs font-bold text-gray-400">
                                                        Interactive Controls:
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPhoneVal("+12025550143")
                                                            }
                                                            className="rounded bg-gray-800 px-2.5 py-1 font-medium text-gray-200 transition-colors hover:bg-gray-700"
                                                        >
                                                            Paste US (+1)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPhoneVal("+919876543210")
                                                            }
                                                            className="rounded bg-gray-800 px-2.5 py-1 font-medium text-gray-200 transition-colors hover:bg-gray-700"
                                                        >
                                                            Paste IN (+91)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPhoneDisabled(!phoneDisabled)
                                                            }
                                                            className={`rounded px-2.5 py-1 font-medium transition-colors ${phoneDisabled ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-200"}`}
                                                        >
                                                            {phoneDisabled ? "Enable" : "Disable"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* JSX Code Snippet */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                                        Integration JSX Snippet
                                    </h3>
                                    <div className="relative overflow-x-auto rounded-2xl bg-gray-900 p-5 font-mono text-xs text-gray-100 shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyCode(
                                                    `<PhoneInput\n  label="Mobile Number"\n  defaultCountry="IN"\n  value={phone}\n  onChange={(value, meta) => console.log(value, meta.isValid)}\n/>`,
                                                    "phone-jsx",
                                                )
                                            }
                                            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-gray-400 transition-colors hover:text-white"
                                        >
                                            <Icon
                                                icon={
                                                    copiedSnippet === "phone-jsx"
                                                        ? "lucide:check"
                                                        : "lucide:copy"
                                                }
                                                className="h-3.5 w-3.5"
                                            />
                                            <span>Copy JSX</span>
                                        </button>

                                        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-gray-200">
                                            <code>{`import { PhoneInput } from "@ros/ui"

function MyForm() {
  const [phone, setPhone] = useState("")

  return (
    <PhoneInput
      label="Vendor Mobile Number"
      defaultCountry="IN"
      value={phone}
      onChange={(value, meta) => {
        setPhone(value)
        console.log("Valid:", meta.isValid, "E.164:", meta.e164)
      }}
    />
  )
}`}</code>
                                        </pre>
                                    </div>
                                </div>

                                {/* API Reference Table */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                                        API Reference & Props
                                    </h3>
                                    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
                                        <table className="w-full text-left text-xs">
                                            <thead className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Prop</th>
                                                    <th className="px-4 py-3">Type</th>
                                                    <th className="px-4 py-3">Default</th>
                                                    <th className="px-4 py-3">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-800">
                                                <tr>
                                                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                                                        value
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-purple-700">
                                                        string
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">""</td>
                                                    <td className="px-4 py-3">
                                                        Controlled input phone number string.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                                                        onChange
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-purple-700">
                                                        (val, meta) =&gt; void
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">
                                                        undefined
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        Callback fired on change, returning
                                                        formatted string & validation metadata.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                                                        defaultCountry
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-purple-700">
                                                        CountryCode
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-gray-600">
                                                        "IN"
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        Default ISO country code selected initially.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                                                        label
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-purple-700">
                                                        string
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">
                                                        undefined
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        Optional input field header label.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                                                        error
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-purple-700">
                                                        string
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">
                                                        undefined
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        Custom validation error message override
                                                        string.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: Button Component */}
                        {activeSection === "button" && (
                            <div className="space-y-10">
                                <div>
                                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
                                        Button
                                    </h1>
                                    <p className="text-base text-gray-600">
                                        Standard UI button supporting primary, secondary, outline,
                                        and danger variants with built-in animated loading spinners.
                                    </p>
                                </div>

                                {/* Live Canvas */}
                                <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                                            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={btnLoading}
                                                    onChange={(e) =>
                                                        setBtnLoading(e.target.checked)
                                                    }
                                                    className="rounded border-gray-300 text-[#0B4E3E] focus:ring-[#0B4E3E]"
                                                />
                                                Toggle Loading Spinner State
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <Button
                                                variant="primary"
                                                isLoading={btnLoading}
                                                onClick={() =>
                                                    toast.success("Primary action executed!")
                                                }
                                                className="rounded-xl px-6 py-3"
                                            >
                                                Primary Action
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                isLoading={btnLoading}
                                                onClick={() =>
                                                    toast.info("Secondary action executed!")
                                                }
                                                className="rounded-xl px-6 py-3"
                                            >
                                                Secondary Action
                                            </Button>

                                            <Button
                                                variant="outline"
                                                isLoading={btnLoading}
                                                onClick={() =>
                                                    toast.info("Outline action executed!")
                                                }
                                                className="rounded-xl px-6 py-3"
                                            >
                                                Outline Action
                                            </Button>

                                            <Button
                                                variant="danger"
                                                isLoading={btnLoading}
                                                onClick={() =>
                                                    toast.error("Danger action executed!")
                                                }
                                                className="rounded-xl px-6 py-3"
                                            >
                                                Delete Item
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: Input Component */}
                        {activeSection === "input" && (
                            <div className="space-y-10">
                                <div>
                                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
                                        Input
                                    </h1>
                                    <p className="text-base text-gray-600">
                                        Styled input text field component supporting labels and
                                        error state formatting.
                                    </p>
                                </div>

                                <div className="max-w-xl space-y-6 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs">
                                    <Input
                                        label="Full Name"
                                        placeholder="e.g. Ramesh Sharma"
                                        value={inputVal}
                                        onChange={(e) => setInputVal(e.target.value)}
                                    />

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="vendor@mandi.com"
                                        error={inputError}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            if (val && !val.includes("@")) {
                                                setInputError("Please enter a valid email address")
                                            } else {
                                                setInputError("")
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section: Sonner Toasts & Spinner */}
                        {(activeSection === "toast" || activeSection === "spinner") && (
                            <div className="space-y-10">
                                <div>
                                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
                                        Sonner Toasts & Spinner
                                    </h1>
                                    <p className="text-base text-gray-600">
                                        Non-intrusive toast notifications and animated SVG spinner
                                        icons.
                                    </p>
                                </div>

                                <div className="space-y-8 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
                                            Test Toast Triggers
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toast.success("Order saved successfully!")
                                                }
                                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                                            >
                                                Trigger Success Toast
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toast.error(
                                                        "Failed to connect to backend service!",
                                                    )
                                                }
                                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
                                            >
                                                Trigger Error Toast
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-gray-100 pt-6">
                                        <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
                                            Spinner Sizes
                                        </h3>
                                        <div className="flex items-center gap-6 text-[#0B4E3E]">
                                            <div className="flex items-center gap-2">
                                                <Spinner size={16} />
                                                <span className="text-xs text-gray-600">16px</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Spinner size={24} />
                                                <span className="text-xs text-gray-600">24px</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Spinner size={32} />
                                                <span className="text-xs text-gray-600">32px</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
