'use client'
import { useEffect, useState } from 'react'
import { AdminGate, toLocalInput } from '@/lib/admin'
import { useEvent, useLive, PHASES } from '@/lib/ui'
import { supabase } from '@/lib/supabase'

export default function Params() {
  const { settings: s } = useEvent()
  const all = useLive(async () => (await supabase.from('announcements').select('*').order('created_at', { ascending: false })).data || [], ['announcements'], [] as any[])
  const [f, setF] = useState<any>(null), [ann, setAnn] = useState(''), [msg, setMsg] = useState('')
  useEffect(() => { if (s && !f) setF({ ...s, starts_local: toLocalInput(s.starts_at) }) }, [s])
  if (!f) return <AdminGate><p>Chargement…</p></AdminGate>
  const upd = async (patch: any) => { const r = await supabase.from('settings').update(patch).eq('id', 1); setMsg(r.error ? r.error.message : 'Enregistré ✔') }
  const save = () => upd({ title: f.title, starts_at: new Date(f.starts_local).toISOString(), points_per_kill: +f.points_per_kill, auto_scoring: f.auto_scoring, show_ranking: f.show_ranking })
  const reset = async () => {
    if (!confirm('Réinitialiser TOUTES les statistiques (éliminations, points manuels, statuts) ?')) return
    await supabase.from('eliminations').delete().not('id', 'is', null)
    await supabase.from('duos').update({ points_override: null, status: 'ACTIVE' }).neq('status', 'ABSENT')
    setMsg('Statistiques réinitialisées')
  }
  return (
    <AdminGate>
      <h1 className="title mb-4 text-3xl">Paramètres de l’événement</h1>
      <div className="card mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">{Object.entries(PHASES).map(([k, l]) => <button key={k} className={'btn2 ' + (s?.phase === k ? '!bg-violet-600' : '')} onClick={() => upd({ phase: k })}>{k === 'LIVE' ? '🔴 ' : ''}{l}</button>)}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">Nom<input className="inp" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></label>
          <label className="text-sm">Date et heure<input className="inp" type="datetime-local" value={f.starts_local} onChange={e => setF({ ...f, starts_local: e.target.value })} /></label>
          <label className="text-sm">Points par élimination<input className="inp" type="number" value={f.points_per_kill} onChange={e => setF({ ...f, points_per_kill: e.target.value })} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.auto_scoring} onChange={e => setF({ ...f, auto_scoring: e.target.checked })} />Calcul automatique des points</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.show_ranking} onChange={e => setF({ ...f, show_ranking: e.target.checked })} />Afficher le classement</label>
        <button className="btn" onClick={save}>Enregistrer</button>
        {msg && <p className="text-sm text-emerald-300">{msg}</p>}
      </div>
      <h2 className="mb-2 text-lg font-black">Annonces</h2>
      <div className="card mb-4 space-y-2">
        <div className="flex gap-2"><input className="inp" placeholder="Nouvelle annonce…" value={ann} onChange={e => setAnn(e.target.value)} /><button className="btn" onClick={async () => { if (ann) { await supabase.from('announcements').insert({ body: ann }); setAnn('') } }}>Publier</button></div>
        {all.map((a: any) => <div key={a.id} className="flex items-center gap-2 text-sm"><span className={a.active ? '' : 'opacity-40'}>{a.body}</span><button className="btn2 ml-auto" onClick={() => supabase.from('announcements').update({ active: !a.active }).eq('id', a.id)}>{a.active ? 'Masquer' : 'Afficher'}</button><button className="btn2 text-rose-300" onClick={() => supabase.from('announcements').delete().eq('id', a.id)}>✕</button></div>)}
      </div>
      <button className="btn2 !border-rose-400/60 text-rose-300" onClick={reset}>Réinitialiser les statistiques</button>
    </AdminGate>
  )
}
