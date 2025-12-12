
import React, {useEffect, useState} from 'react'
import API from '../api'

export default function AdminPanel(){
  const [users, setUsers] = useState([])

  useEffect(()=>{
    // Simple fetch - you'll need admin endpoints to list users
    API.get('/users').then(r=>setUsers(r.data)).catch(()=>{})
  },[])

  return (
    <div className="p-6">
      <h1 className="text-3xl">Admin Panel</h1>
      <p className="mt-4">Ici : gestion des utilisateurs, stats, billing etc.</p>
      <div className="mt-6">
        {users.length===0 ? <div className="text-sm opacity-70">No users (implement user listing)</div> : users.map(u=>(<div key={u.id}>{u.email}</div>))}
      </div>
    </div>
  )
}
