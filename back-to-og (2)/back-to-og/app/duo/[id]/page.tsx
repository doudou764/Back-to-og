'use client'
import Link from 'next/link'
import { useEvent, Badge, ElimLine, Demo } from '@/lib/ui'

export default function DuoPage({ params }: { params: { id: string } }) {
  const { duos, elims } = useEvent()
  const d = duos.find(x => x.id === params.id)
  if (!d) return <main className="p-10 text-center">Duo introuvable. <Link href="/duos" className="text-sky-300">Retour</Link></main>
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <Link href="/duos" className="text-sm text-sky-300">← Tous les duos</Link>
      <h1 className="title text-4xl">{d.name}{d.demo && <Demo />}</h1>
      <p className="text-lg">{d.player1} & {d.player2}</p>
      <div className="flex items-center gap-4"><Badge s={d.status} /><span>Position #{d.pos}</span><span>{d.kills} élim.</span><b className="text-sky-300">{d.points} pts</b></div>
      <h2 className="pt-4 text-xl font-black">Éliminations liées</h2>
      {elims.filter(e => e.eliminated_id === d.id || e.eliminator_id === d.id).map(e => <ElimLine key={e.id} e={e} duos={duos} />)}
    </main>
  )
}
