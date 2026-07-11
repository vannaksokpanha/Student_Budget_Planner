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
import CreateGroup from './components/Team/CreateGroup.jsx'
import JoinGroup from './components/Team/JoinGroup.jsx'
import AddContribution from './components/Team/AddContribution.jsx'
import ViewHistory from './components/Team/ViewHistory.jsx'
import SetExpense from './components/Team/SetExpense.jsx'
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
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/join-group" element={<JoinGroup />} />
          <Route path="/group/:groupId/contribute" element={<AddContribution />} />
          <Route path="/group/:groupId/history" element={<ViewHistory />} />
          <Route path="/group/:groupId/expense/:expenseId/items" element={<SetExpense />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
