'use client'
import { useEvent, ElimLine } from '@/lib/ui'
export default function Elims() {
  const { elims, duos } = useEvent()
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="title mb-6 text-4xl">Éliminations en direct</h1>
      <div className="space-y-2">{elims.map(e => <ElimLine key={e.id} e={e} duos={duos} />)}{!elims.length && <p className="text-slate-400">Aucune élimination pour le moment.</p>}</div>
    </main>
  )
}
