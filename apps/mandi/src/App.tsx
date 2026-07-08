import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import Orders from "@/pages/Orders"
import Payment from "@/pages/Payment"
import Transaction from "@/pages/Transaction"
import Finance from "@/pages/Finance"
import Search from "@/pages/Search"
import Profile from "@/pages/Profile"

function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <Orders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment"
                element={
                    <ProtectedRoute>
                        <Payment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/transaction"
                element={
                    <ProtectedRoute>
                        <Transaction />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/finance"
                element={
                    <ProtectedRoute>
                        <Finance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/search"
                element={
                    <ProtectedRoute>
                        <Search />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
