
import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function App(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#071022] text-white">
      <nav className="p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Futuristic SaaS</Link>
        <div className="space-x-4">
          <Link to="/billing">Billing</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>
      <main className="p-6"><Outlet/></main>
    </div>
  )
}
