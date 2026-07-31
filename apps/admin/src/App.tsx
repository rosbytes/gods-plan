import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import CreateVendor from "./pages/CreateVendor"
import CreateStore from "./pages/CreateStore"
// import StoreDetails from "./pages/StoreDetails"
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Vendor Onboarding */}
                <Route path="/vendor/:vendorId" element={<VendorProfile />} />
                <Route path="/create-vendor" element={<CreateVendor />} />
                <Route path="/create-store/:vendorId" element={<CreateStore />} />
                <Route path="/kyc/:vendorId/:storeId" element={<KycDocuments />} />
                <Route path="/success/:vendorId/:storeId" element={<Success />} />
                <Route path="/payment/:vendorId/:storeId" element={<Payment />} />
                <Route path="/payment-status/:vendorId/:storeId" element={<PaymentStatus />} />
                <Route path="/agreement/:vendorId/:storeId" element={<VendorAgreement />} />
                <Route path="/registered/:vendorId/:storeId" element={<FinalSuccess />} />
                {/* legacy route kept for backwards compat */}
                <Route path="/payment-success/:vendorId/:storeId" element={<PaymentSuccess />} />
                {/* Management Pages */}
                <Route path="/manage/cities" element={<ManageCities />} />
                <Route path="/manage/mandis" element={<ManageMandis />} />
                <Route path="/manage/vegetables" element={<ManageVegetables />} />
            </Routes>
        </Router>
    )
}

export default App
