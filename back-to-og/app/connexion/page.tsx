'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Connexion() {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [mode, setMode] = useState<'in' | 'up'>('in'), [msg, setMsg] = useState('')
  async function go() {
    setMsg('')
    const r = mode === 'in' ? await supabase.auth.signInWithPassword({ email, password: pw }) : await supabase.auth.signUp({ email, password: pw })
    if (r.error) return setMsg(r.error.message)
    if (mode === 'up') return setMsg('Compte créé. Valide l’e-mail si demandé, puis un SUPER_ADMIN doit te donner un rôle.')
    location.href = '/admin'
  }
  return (
    <main className="mx-auto max-w-sm space-y-3 px-4 py-16">
      <h1 className="title text-3xl">{mode === 'in' ? 'Connexion' : 'Créer un compte'}</h1>
      <input className="inp" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="inp" type="password" placeholder="Mot de passe (8+ caractères)" value={pw} onChange={e => setPw(e.target.value)} />
      <button className="btn w-full" onClick={go}>{mode === 'in' ? 'Se connecter' : 'Créer le compte'}</button>
      <button className="btn2 w-full" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>{mode === 'in' ? 'Pas de compte ? Créer' : 'Déjà un compte ? Connexion'}</button>
      {msg && <p className="text-sm text-amber-300">{msg}</p>}
    </main>
  )
}
