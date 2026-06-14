import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import SetUp from './pages/SetUp.jsx'
import Expense from './pages/Expense.jsx'
import Savings from './pages/Savings.jsx'
import Summary from './pages/Summary.jsx'
import Profile from './pages/Profile.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/setup" element={<SetUp />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/expenses" element={<Expense />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
