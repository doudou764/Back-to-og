'use client'
import Link from 'next/link'
import { AdminGate } from '@/lib/admin'
import { useEvent, useLive, PHASES } from '@/lib/ui'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const { settings: s, duos, elims } = useEvent()
  const log = useLive(async () => (await supabase.from('audit_log').select('*').order('at', { ascending: false }).limit(10)).data || [], ['audit_log'], [] as any[])
  return (
    <AdminGate>
      <h1 className="title mb-6 text-3xl">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Duos', duos.length], ['Joueurs', duos.length * 2], ['Éliminations', elims.length], ['État', PHASES[s?.phase || 'UPCOMING']]].map(([l, v]) => <div key={l as string} className="card text-center"><div className="text-2xl font-black text-sky-300">{v}</div><div className="text-xs uppercase text-slate-400">{l}</div></div>)}
      </div>
      <div className="my-6 flex flex-wrap gap-3"><Link href="/admin/eliminations" className="btn">+ Publier une élimination</Link><Link href="/admin/duos" className="btn">Gérer les duos</Link><Link href="/admin/parametres" className="btn">Paramètres & LIVE</Link></div>
      <h2 className="mb-2 text-lg font-black">Dernières actions</h2>
      <div className="card space-y-1 text-sm">{log.map((l: any) => <div key={l.id} className="flex gap-3"><span className="text-slate-400">{new Date(l.at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span><b>{l.action}</b><span>{l.tbl}</span></div>)}{!log.length && <p className="text-slate-400">Rien pour l’instant.</p>}</div>
    </AdminGate>
  )
}
