import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import CreateVendor from "./pages/CreateVendor"
import CreateStore from "./pages/CreateStore"
import KycDocuments from "./pages/KycDocuments"
import Success from "./pages/Success"
import Payment from "./pages/Payment"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentStatus from "./pages/PaymentStatus"
import VendorAgreement from "./pages/VendorAgreement"
import FinalSuccess from "./pages/FinalSuccess"
import VendorProfile from "./pages/VendorProfile"
import ManageCities from "./pages/ManageCities"
import ManageMandis from "./pages/ManageMandis"
import ManageVegetables from "./pages/ManageVegetables"
import ManageAdmins from "./pages/ManageAdmins"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

function App() {
    return (
        <Router>
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
        </Router>
    )
}

export default App
