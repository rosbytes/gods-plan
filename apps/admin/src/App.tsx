import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

const Login = lazy(() => import("./pages/Login"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const CreateVendor = lazy(() => import("./pages/CreateVendor"))
const CreateStore = lazy(() => import("./pages/CreateStore"))
const KycDocuments = lazy(() => import("./pages/KycDocuments"))
const Success = lazy(() => import("./pages/Success"))
const Payment = lazy(() => import("./pages/Payment"))
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"))
const PaymentStatus = lazy(() => import("./pages/PaymentStatus"))
const VendorAgreement = lazy(() => import("./pages/VendorAgreement"))
const FinalSuccess = lazy(() => import("./pages/FinalSuccess"))
const VendorProfile = lazy(() => import("./pages/VendorProfile"))
const ManageCities = lazy(() => import("./pages/ManageCities"))
const ManageMandis = lazy(() => import("./pages/ManageMandis"))
const ManageVegetables = lazy(() => import("./pages/ManageVegetables"))
const ManageAdmins = lazy(() => import("./pages/ManageAdmins"))
const ManageAssets = lazy(() => import("./pages/ManageAssets"))

const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-700" />
    </div>
)

function App() {
    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Dashboard & Management Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage/cities"
                        element={
                            <ProtectedRoute>
                                <ManageCities />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage/mandis"
                        element={
                            <ProtectedRoute>
                                <ManageMandis />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage/vegetables"
                        element={
                            <ProtectedRoute>
                                <ManageVegetables />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage/admins"
                        element={
                            <ProtectedRoute>
                                <ManageAdmins />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage/assets"
                        element={
                            <ProtectedRoute>
                                <ManageAssets />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Vendor Onboarding & Profile Routes */}
                    <Route
                        path="/vendor/:vendorId"
                        element={
                            <ProtectedRoute>
                                <VendorProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-vendor"
                        element={
                            <ProtectedRoute>
                                <CreateVendor />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-store/:vendorId"
                        element={
                            <ProtectedRoute>
                                <CreateStore />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/kyc/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <KycDocuments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/success/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <Success />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <Payment />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment-status/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <PaymentStatus />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agreement/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <VendorAgreement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/registered/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <FinalSuccess />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment-success/:vendorId/:storeId"
                        element={
                            <ProtectedRoute>
                                <PaymentSuccess />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </Router>
    )
}

export default App
