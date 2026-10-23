import './globals.css'
import Link from 'next/link'
export const metadata = { title: 'BACK TO OG — Événement Fortnite', description: 'Suivi en direct des duos, du classement et des éliminations de BACK TO OG.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <nav className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-indigo-400/20 bg-[#060a1c]/90 px-4 py-3 backdrop-blur">
          <Link href="/" className="title text-xl">BACK TO OG</Link>
          <Link href="/duos" className="text-sm hover:text-sky-300">Duos</Link>
          <Link href="/classement" className="text-sm hover:text-sky-300">Classement</Link>
          <Link href="/eliminations" className="text-sm hover:text-sky-300">Éliminations</Link>
          <Link href="/admin" className="ml-auto text-sm text-slate-400 hover:text-sky-300">Admin</Link>
        </nav>
        {children}
        <footer className="p-8 text-center text-xs text-slate-500">Site non officiel · Aucune donnée n’est issue d’un flux officiel Fortnite · Les données marquées DÉMO sont fictives</footer>
      </body>
    </html>
  )
}
