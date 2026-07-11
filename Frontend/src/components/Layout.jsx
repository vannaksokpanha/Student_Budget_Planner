import React, { useState } from 'react'
import NavBar from './NavBar'
import { Outlet } from 'react-router-dom'
const Layout = () => {
  const [sidebarOpen , setSidebarOpen] = useState(true)
  return (
    <div>
        <NavBar isOpen = {sidebarOpen} setIsOpen={setSidebarOpen}/>
        {/* md:ml-60 clears the sidebar, pb-20 clears the mobile bottom bar */}
        <main
         className={`pb-2 transition-[margin] duration-300 ease-in-out ${
          sidebarOpen
          ?  'md:ml-80'
          :  'md:ml-20'
         }`}>
            <Outlet/>
        </main>
        {/* When someone visits /home, React Router renders Layout first (the parent),
         and then needs to know where inside Layout to put Home. That's what <Outlet /> marks */}
    </div>
  )
}

export default Layout
