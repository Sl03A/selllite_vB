
import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../auth'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      nav('/')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Erreur login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="bg-[#071026] p-8 rounded-2xl w-96" onSubmit={handle}>
        <h2 className="text-2xl mb-4">Connexion</h2>
        {err && <div className="text-red-400 mb-2">{err}</div>}
        <input className="w-full p-2 mb-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 mb-4 rounded" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full py-2 rounded bg-neon text-black">Se connecter</button>
      </form>
    </div>
  )
}
