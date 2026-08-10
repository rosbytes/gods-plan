import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import ReviewOrder from "./pages/ReviewOrder"
import OrderSuccess from "./pages/OrderSuccess"
import Pickup from "./pages/Pickup"
import Orders from "./pages/Orders"
import OrderDetails from "./pages/OrderDetails"

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/review-order" element={<ReviewOrder />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/pickup" element={<Pickup />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
            </Routes>
        </Router>
    )
}

export default App
