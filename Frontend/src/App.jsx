import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import DailyLog from './pages/DailyLog.jsx'
import MonthlyBudget from './pages/MonthlyBudget.jsx'
import Savings from './pages/Savings.jsx'
import Summary from './pages/Summary.jsx'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<DailyLog />} />
        <Route path="/expense" element={<MonthlyBudget />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/summary" element={<Summary />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
