'use client'
import { useState } from 'react'
import { AdminGate, toLocalInput } from '@/lib/admin'
import { useEvent, useLive, hhmm, Elim } from '@/lib/ui'
import { supabase } from '@/lib/supabase'

export default function AdminElims() {
  const { duos } = useEvent()
  const all = useLive(async () => ((await supabase.from('eliminations').select('*').order('happened_at', { ascending: false })).data || []) as Elim[], ['eliminations'], [] as Elim[])
  const [a, setA] = useState(''), [b, setB] = useState(''), [t, setT] = useState(toLocalInput(new Date().toISOString())), [note, setNote] = useState(''), [msg, setMsg] = useState('')
  const n = (id: string | null) => duos.find(d => d.id === id)?.name || '—'
  const run = async (p: PromiseLike<any>) => { const r = await p; setMsg(r.error ? (r.error.code === '23505' ? 'Ce duo est déjà éliminé (doublon bloqué).' : r.error.message) : ''); return r }
  const pub = async () => {
    if (!a) return setMsg('Choisis le duo éliminé.')
    const r = await run(supabase.from('eliminations').insert({ eliminated_id: a, eliminator_id: b || null, happened_at: new Date(t).toISOString(), note: note || null }))
    if (!r.error) { setA(''); setB(''); setNote(''); setT(toLocalInput(new Date().toISOString())) }
  }
  return (
    <AdminGate>
      <h1 className="title mb-4 text-3xl">Éliminations</h1>
      <div className="card mb-6 grid gap-2 sm:grid-cols-2">
        <select className="inp" value={a} onChange={e => setA(e.target.value)}><option value="">Duo éliminé…</option>{duos.filter(d => d.status === 'ACTIVE').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select className="inp" value={b} onChange={e => setB(e.target.value)}><option value="">Éliminé par… (inconnu)</option>{duos.filter(d => d.id !== a).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <input className="inp" type="datetime-local" value={t} onChange={e => setT(e.target.value)} />
        <input className="inp" placeholder="Note (facultatif)" value={note} onChange={e => setNote(e.target.value)} />
        <button className="btn sm:col-span-2" onClick={pub}>Publier l’élimination</button>
        {msg && <p className="text-sm text-rose-300 sm:col-span-2">{msg}</p>}
      </div>
      <div className="space-y-2">
        {all.map(e => (
          <div key={e.id} className={'card flex flex-wrap items-center gap-3 ' + (e.cancelled ? 'opacity-50' : '')}>
            <span className="text-sm text-slate-400">{hhmm(e.happened_at)}</span><span><b>{n(e.eliminated_id)}</b> éliminé par {n(e.eliminator_id)}</span>{e.cancelled && <span className="text-xs text-amber-300">ANNULÉE</span>}
            <span className="ml-auto flex gap-2">
              <button className="btn2" onClick={() => run(supabase.from('eliminations').update({ cancelled: !e.cancelled }).eq('id', e.id))}>{e.cancelled ? 'Rétablir' : 'Annuler'}</button>
              <button className="btn2 !border-rose-400/50 text-rose-300" onClick={() => confirm('Supprimer définitivement ?') && run(supabase.from('eliminations').delete().eq('id', e.id))}>Supprimer</button>
            </span>
          </div>
        ))}
      </div>
    </AdminGate>
  )
}
