import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import ReviewOrder from "./pages/ReviewOrder"
import OrderSuccess from "./pages/OrderSuccess"

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/review-order" element={<ReviewOrder />} />
                <Route path="/order-success" element={<OrderSuccess />} />
            </Routes>
        </Router>
    )
}

export default App
