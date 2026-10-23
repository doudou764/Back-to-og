'use client'
import { useEvent, RankTable } from '@/lib/ui'
export default function Classement() {
  const { duos, settings } = useEvent()
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="title mb-2 text-4xl">Classement</h1>
      <p className="mb-6 text-sm text-slate-400">Barème actuel : {settings?.points_per_kill ?? 1} pt par élimination. Barème défini par l’organisation du site, non officiel.</p>
      {settings?.show_ranking === false ? <p className="card">Le classement est masqué pour le moment.</p> : <RankTable duos={duos} />}
    </main>
  )
}
