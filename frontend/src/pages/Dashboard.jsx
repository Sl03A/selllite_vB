
import React, {useEffect, useState} from 'react'
import API from '../api'
import { logout } from '../auth'

export default function Dashboard(){
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  useEffect(()=> {
    API.get('/users/me').then(r=>setUser(r.data)).catch(()=>null)
    API.get('/projects').then(r=>setProjects(r.data)).catch(()=>{})
  },[])

  const create = async () => {
    const r = await API.post('/projects', {title, description: desc})
    setProjects([r.data, ...projects])
    setTitle(''); setDesc('')
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Dashboard</h1>
        <div>
          {user ? <span className="mr-4">{user.email}</span> : null}
          <button className="px-3 py-1 bg-gray-800 rounded" onClick={()=>{ logout(); window.location='/login' }}>Logout</button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-[#081026] rounded">
        <h2 className="text-xl mb-2">Nouveau projet</h2>
        <input className="w-full p-2 mb-2 rounded" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="w-full p-2 mb-2 rounded" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button className="px-4 py-2 bg-neon text-black rounded" onClick={create}>Créer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(p=>(
          <div key={p.id} className="p-4 rounded bg-[#071026]">
            <h3 className="text-lg font-bold">{p.title}</h3>
            <p className="text-sm opacity-80">{p.description}</p>
            <div className="text-xs mt-2">owner: {p.owner_id}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
