import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import DailyLog from './pages/DailyLog.jsx'
import SetUp from './pages/SetUp.jsx'
import MonthlyBudget from './pages/MonthlyBudget.jsx'
import Savings from './pages/Savings.jsx'
import Summary from './pages/Summary.jsx'
import Profile from './pages/Profile.jsx'
import TeamBudget from './pages/TeamBudget.jsx'
import Layout from './components/Layout.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<DailyLog />} />
          <Route path="/setup" element={<SetUp />} />
          <Route path="/expense" element={<MonthlyBudget />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/team" element={<TeamBudget />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
