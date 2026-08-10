import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import ReviewOrder from "./pages/ReviewOrder"
import OrderSuccess from "./pages/OrderSuccess"
import Pickup from "./pages/Pickup"
import Orders from "./pages/Orders"
import OrderDetails from "./pages/OrderDetails"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/review-order"
                    element={
                        <ProtectedRoute>
                            <ReviewOrder />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/order-success"
                    element={
                        <ProtectedRoute>
                            <OrderSuccess />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pickup"
                    element={
                        <ProtectedRoute>
                            <Pickup />
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
                    path="/orders/:orderId"
                    element={
                        <ProtectedRoute>
                            <OrderDetails />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    )
}

export default App
