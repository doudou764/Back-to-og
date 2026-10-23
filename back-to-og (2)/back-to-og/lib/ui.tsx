'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Duo = { id: string; name: string; player1: string; player2: string; status: string; demo: boolean; kills: number; points: number; pos: number }
export type Elim = { id: string; eliminated_id: string; eliminator_id: string | null; happened_at: string; note: string | null; cancelled: boolean }

export const hhmm = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' })
export const PHASES: Record<string, string> = { UPCOMING: 'À venir', LIVE: 'En direct', PAUSED: 'En pause', ENDED: 'Terminé' }

export function useLive<T>(load: () => PromiseLike<T>, tables: string[], init: T): T {
  const [d, setD] = useState<T>(init)
  useEffect(() => {
    let on = true
    const run = async () => { const r = await load(); if (on) setD(r) }
    run()
    const ch = supabase.channel('rt' + Math.random().toString(36).slice(2))
    tables.forEach(t => ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, run))
    ch.subscribe()
    return () => { on = false; supabase.removeChannel(ch) }
  }, [])
  return d
}

export function useEvent() {
  return useLive(async () => {
    const [s, r, e, a] = await Promise.all([
      supabase.from('settings').select('*').single(),
      supabase.from('ranking').select('*').order('pos').order('name'),
      supabase.from('eliminations').select('*').eq('cancelled', false).order('happened_at', { ascending: false }).limit(200),
      supabase.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false }),
    ])
    return { settings: s.data as any, duos: (r.data || []) as Duo[], elims: (e.data || []) as Elim[], news: (a.data || []) as any[] }
  }, ['duos', 'eliminations', 'settings', 'announcements'], { settings: null as any, duos: [] as Duo[], elims: [] as Elim[], news: [] as any[] })
}

export function Badge({ s }: { s: string }) {
  const m: any = { ACTIVE: ['En compétition', 'bg-emerald-500/20 text-emerald-300'], ELIMINATED: ['Éliminé', 'bg-rose-500/20 text-rose-300'], ABSENT: ['Absent', 'bg-slate-500/30 text-slate-300'] }
  const [t, c] = m[s] || m.ACTIVE
  return <span className={'rounded-full px-2.5 py-0.5 text-xs font-bold ' + c}>{t}</span>
}
export const Demo = () => <span className="ml-2 rounded bg-amber-400/20 px-1.5 text-[10px] font-bold text-amber-300">DÉMO</span>

export function ElimLine({ e, duos }: { e: Elim; duos: Duo[] }) {
  const n = (id: string | null) => duos.find(d => d.id === id)?.name || '?'
  return (
    <div className="up card flex flex-wrap items-center gap-2 border-rose-400/30">
      <span className="rounded bg-rose-500 px-2 py-0.5 text-xs font-black">ÉLIMINATION</span>
      <span><b>{n(e.eliminated_id)}</b> éliminé{e.eliminator_id ? <> par <b className="text-sky-300">{n(e.eliminator_id)}</b></> : null}</span>
      <span className="ml-auto text-sm text-slate-400">{hhmm(e.happened_at)}</span>
      {e.note && <p className="w-full text-sm text-slate-400">{e.note}</p>}
    </div>
  )
}

export function Countdown({ to }: { to: string }) {
  const [n, setN] = useState(0)
  useEffect(() => { setN(Date.now()); const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i) }, [])
  if (!n) return null
  const t = Math.max(0, new Date(to).getTime() - n)
  const v = [[Math.floor(t / 864e5), 'jours'], [Math.floor(t / 36e5) % 24, 'heures'], [Math.floor(t / 6e4) % 60, 'min'], [Math.floor(t / 1e3) % 60, 'sec']]
  return (
    <div className="flex justify-center gap-3">
      {v.map(([x, l]) => (
        <div key={l as string} className="card w-20 text-center"><div className="text-3xl font-black text-sky-300">{String(x).padStart(2, '0')}</div><div className="text-xs uppercase text-slate-400">{l}</div></div>
      ))}
    </div>
  )
}

export function RankTable({ duos }: { duos: Duo[] }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400"><tr><th className="p-3">#</th><th>Duo</th><th>Joueurs</th><th>Élim.</th><th>Pts</th><th>Statut</th></tr></thead>
        <tbody>
          {duos.map(d => (
            <tr key={d.id} className="border-t border-indigo-400/10">
              <td className="p-3 font-black text-violet-300">{d.pos}</td>
              <td className="font-bold">{d.name}{d.demo && <Demo />}</td>
              <td className="text-slate-300">{d.player1} & {d.player2}</td>
              <td>{d.kills}</td><td className="font-bold text-sky-300">{d.points}</td><td><Badge s={d.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
