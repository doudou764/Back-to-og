'use client'
import { useState } from 'react'
import { AdminGate } from '@/lib/admin'
import { useEvent, Badge, Demo } from '@/lib/ui'
import { supabase } from '@/lib/supabase'

export default function AdminDuos() {
  const { duos } = useEvent()
  const [f, setF] = useState({ name: '', player1: '', player2: '' }), [csv, setCsv] = useState(''), [msg, setMsg] = useState('')
  const run = async (p: PromiseLike<any>) => { const r = await p; setMsg(r.error ? r.error.message : '') }
  const add = async () => { if (!f.player1 || !f.player2) return; await run(supabase.from('duos').insert({ name: f.name || `${f.player1} & ${f.player2}`, player1: f.player1, player2: f.player2 })); setF({ name: '', player1: '', player2: '' }) }
  const imp = async () => {
    const rows = csv.split('\n').map(l => l.split(/[;,]/).map(x => x.trim())).filter(r => r.length >= 3 && r[1] && r[2]).map(r => ({ name: r[0] || `${r[1]} & ${r[2]}`, player1: r[1], player2: r[2] }))
    if (rows.length) { await run(supabase.from('duos').insert(rows)); setCsv('') }
  }
  const exp = () => { const t = 'nom;joueur1;joueur2;statut;points\n' + duos.map(d => [d.name, d.player1, d.player2, d.status, d.points].join(';')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'duos.csv'; a.click() }
  return (
    <AdminGate>
      <h1 className="title mb-4 text-3xl">Gestion des duos</h1>
      <div className="card mb-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-4"><input className="inp" placeholder="Nom du duo" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input className="inp" placeholder="Joueur 1" value={f.player1} onChange={e => setF({ ...f, player1: e.target.value })} /><input className="inp" placeholder="Joueur 2" value={f.player2} onChange={e => setF({ ...f, player2: e.target.value })} /><button className="btn" onClick={add}>Ajouter</button></div>
        <textarea className="inp h-20" placeholder={'Import CSV, une ligne par duo : nom;joueur1;joueur2'} value={csv} onChange={e => setCsv(e.target.value)} />
        <div className="flex gap-2"><button className="btn2" onClick={imp}>Importer</button><button className="btn2" onClick={exp}>Exporter CSV</button></div>
        {msg && <p className="text-sm text-rose-300">{msg}</p>}
      </div>
      <div className="space-y-2">
        {duos.map(d => (
          <div key={d.id} className="card flex flex-wrap items-center gap-2">
            <b className="min-w-40">{d.name}{d.demo && <Demo />}</b><span className="text-sm text-slate-300">{d.player1} & {d.player2}</span><Badge s={d.status} />
            <select className="inp !w-auto" value={d.status} onChange={e => run(supabase.from('duos').update({ status: e.target.value }).eq('id', d.id))}><option value="ACTIVE">En compétition</option><option value="ELIMINATED">Éliminé</option><option value="ABSENT">Absent</option></select>
            <input className="inp !w-24" type="number" placeholder="Pts" defaultValue={d.points} title="Points manuels (remplace le calcul auto)" onBlur={e => run(supabase.from('duos').update({ points_override: e.target.value === '' ? null : +e.target.value }).eq('id', d.id))} />
            <button className="btn2" onClick={() => { const n = prompt('Nom du duo', d.name); if (n) run(supabase.from('duos').update({ name: n }).eq('id', d.id)) }}>Renommer</button>
            <button className="btn2 !border-rose-400/50 text-rose-300" onClick={() => confirm('Supprimer ce duo ?') && run(supabase.from('duos').delete().eq('id', d.id))}>Supprimer</button>
          </div>
        ))}
      </div>
    </AdminGate>
  )
}
