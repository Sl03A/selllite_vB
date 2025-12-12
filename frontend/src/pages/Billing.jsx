
import React, {useState} from 'react'
import API from '../api'

export default function Billing(){
  const [url, setUrl] = useState('')
  const create = async ()=>{
    const res = await API.post('/billing/create-checkout-session', { success_url: window.location.href, cancel_url: window.location.href })
    setUrl(res.data.url)
  }
  return (
    <div>
      <h1 className="text-2xl mb-4">Billing</h1>
      <p>Test Stripe checkout (sandbox)</p>
      <button className="px-4 py-2 bg-neon text-black rounded mt-4" onClick={create}>Checkout $5</button>
      {url && <div className="mt-4"><a href={url} target="_blank" className="underline">Open Checkout</a></div>}
    </div>
  )
}
