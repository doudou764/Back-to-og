'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<'load' | 'no' | 'ok'>('load')
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      const uid = data.session?.user.id
      if (!uid) return setSt('no')
      const { data: p } = await supabase.from('profiles').select('role').eq('id', uid).single()
      setSt(p && ['ADMIN', 'SUPER_ADMIN'].includes(p.role) ? 'ok' : 'no')
    })()
  }, [])
  if (st === 'load') return <p className="p-8">Chargement…</p>
  if (st === 'no') return <div className="mx-auto max-w-md p-10 text-center"><p className="mb-4">Accès réservé aux administrateurs.</p><Link href="/connexion" className="btn">Connexion</Link></div>
  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 pt-4">
        {[['/admin', 'Tableau de bord'], ['/admin/duos', 'Duos'], ['/admin/eliminations', 'Éliminations'], ['/admin/parametres', 'Paramètres']].map(([h, l]) => <Link key={h} href={h} className="btn2">{l}</Link>)}
        <button className="btn2 ml-auto" onClick={async () => { await supabase.auth.signOut(); location.href = '/' }}>Déconnexion</button>
      </div>
      <div className="mx-auto max-w-5xl p-4">{children}</div>
    </>
  )
}

export const toLocalInput = (iso: string) => { const d = new Date(iso), p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}` }
