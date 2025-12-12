
import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../auth'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    try {
      await register(email, password)
      setMsg('Compte créé — connecte-toi')
      setTimeout(()=>nav('/login'), 1000)
    } catch (e) {
      setMsg(e.response?.data?.detail || 'Erreur')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="bg-[#071026] p-8 rounded-2xl w-96" onSubmit={handle}>
        <h2 className="text-2xl mb-4">Inscription</h2>
        {msg && <div className="text-neon mb-2">{msg}</div>}
        <input className="w-full p-2 mb-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 mb-4 rounded" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full py-2 rounded bg-neon text-black">Créer</button>
      </form>
    </div>
  )
}
