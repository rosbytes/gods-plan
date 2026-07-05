import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Orders from "./pages/Orders"
import Payment from "./pages/Payment"
import Transaction from "./pages/Transaction"
import Finance from "./pages/Finance"
import Search from "./pages/Search"
import Profile from "./pages/Profile"
import "./App.css"

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
    )
}

export default App
