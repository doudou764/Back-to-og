'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useEvent, Badge, Demo } from '@/lib/ui'

export default function Duos() {
  const { duos } = useEvent()
  const [q, setQ] = useState(''), [f, setF] = useState('ALL'), [sort, setSort] = useState('pos')
  const L = duos.filter(d => (f === 'ALL' || d.status === f) && (d.name + d.player1 + d.player2).toLowerCase().includes(q.toLowerCase()))
    .sort((a: any, b: any) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'kills' ? b.kills - a.kills : a.pos - b.pos)
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="title mb-6 text-4xl">Les duos</h1>
      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        <input className="inp" placeholder="Rechercher un duo ou un joueur…" value={q} onChange={e => setQ(e.target.value)} />
        <select className="inp" value={f} onChange={e => setF(e.target.value)}><option value="ALL">Tous les statuts</option><option value="ACTIVE">En compétition</option><option value="ELIMINATED">Éliminés</option><option value="ABSENT">Absents</option></select>
        <select className="inp" value={sort} onChange={e => setSort(e.target.value)}><option value="pos">Tri : classement</option><option value="kills">Tri : éliminations</option><option value="name">Tri : nom</option></select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {L.map(d => (
          <Link key={d.id} href={`/duo/${d.id}`} className={'card up transition hover:-translate-y-1 hover:border-sky-400/50 ' + (d.status === 'ELIMINATED' ? 'opacity-60' : '')}>
            <div className="flex items-center justify-between"><span className="text-sm font-black text-violet-300">#{d.pos}</span><Badge s={d.status} /></div>
            <h3 className="mt-2 text-xl font-black">{d.name}{d.demo && <Demo />}</h3>
            <p className="text-slate-300">{d.player1} & {d.player2}</p>
            <p className="mt-3 text-sm text-slate-400">{d.kills} élim. · <b className="text-sky-300">{d.points} pts</b></p>
          </Link>
        ))}
      </div>
      {!L.length && <p className="text-slate-400">Aucun duo à afficher.</p>}
    </main>
  )
}
