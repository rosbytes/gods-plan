import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import CreateVendor from "./pages/CreateVendor"
import CreateStore from "./pages/CreateStore"
import StoreDetails from "./pages/StoreDetails"
import KycDocuments from "./pages/KycDocuments"
import Success from "./pages/Success"

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-vendor" element={<CreateVendor />} />
                <Route path="/create-store/:vendorId" element={<CreateStore />} />
                <Route path="/kyc/:vendorId/:storeId" element={<KycDocuments />} />
                <Route path="/success" element={<Success />} />
            </Routes>
        </Router>
    )
}

export default App
