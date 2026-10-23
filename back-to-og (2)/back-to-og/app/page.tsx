'use client'
import Link from 'next/link'
import { useEvent, Countdown, ElimLine, RankTable, PHASES } from '@/lib/ui'

export default function Home() {
  const { settings: s, duos, elims, news } = useEvent()
  const phase = s?.phase || 'UPCOMING'
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <section className="up text-center">
        {phase === 'LIVE' && <div className="mx-auto mb-4 w-fit animate-pulse rounded-full bg-rose-600 px-5 py-1 text-sm font-black">🔴 LIVE</div>}
        <h1 className="title text-6xl sm:text-8xl">{s?.title || 'BACK TO OG'}</h1>
        {s && <p className="mt-3 text-lg text-slate-300">{new Date(s.starts_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short' })} (heure de Paris)</p>}
        <p className="mt-2 inline-block rounded-full border border-sky-400/40 px-4 py-1 text-sm font-bold text-sky-300">{PHASES[phase]}</p>
        <div className="mt-6">{s && phase === 'UPCOMING' && <Countdown to={s.starts_at} />}</div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/duos" className="btn">Voir les duos</Link><Link href="/classement" className="btn">Classement</Link><Link href="/eliminations" className="btn">Éliminations</Link>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-3 text-center">
        {[['Duos', duos.length], ['Joueurs', duos.length * 2], ['Éliminations', elims.length]].map(([l, v]) => <div key={l as string} className="card"><div className="text-3xl font-black text-violet-300">{v}</div><div className="text-xs uppercase text-slate-400">{l}</div></div>)}
      </section>
      {news.length > 0 && <section><h2 className="mb-3 text-xl font-black">📢 Annonces</h2><div className="space-y-2">{news.map(a => <div key={a.id} className="card border-amber-400/30">{a.body}</div>)}</div></section>}
      <section><h2 className="mb-3 text-xl font-black">Dernières éliminations</h2><div className="space-y-2">{elims.slice(0, 5).map(e => <ElimLine key={e.id} e={e} duos={duos} />)}{!elims.length && <p className="text-slate-400">Aucune élimination pour le moment.</p>}</div></section>
      {s?.show_ranking !== false && <section><h2 className="mb-3 text-xl font-black">Classement général</h2><RankTable duos={duos.slice(0, 10)} /></section>}
    </main>
  )
}
