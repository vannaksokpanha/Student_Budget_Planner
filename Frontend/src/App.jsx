import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import SetUp from './pages/SetUp.jsx'
import Expense from './pages/Expense.jsx'
import Savings from './pages/Savings.jsx'
import Summary from './pages/Summary.jsx'
import Layout from './components/Layout.jsx'
import TeamBudget from './pages/TeamBudget.jsx'
import { UserProvider } from './Context/UserContext.jsx'


const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element ={<Layout/>}>
            <Route path="/home" element={<Home />} />
            <Route path="/setup" element={<SetUp />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/expenses" element={<Expense />} />
            <Route path="/setup" element={<SetUp />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/team" element={<TeamBudget />} />
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
