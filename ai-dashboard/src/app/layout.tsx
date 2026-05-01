import './globals.css'
import { SiteFooter } from '../components/site-footer'
import { SiteHeader } from '../components/site-header'

export const metadata = {
  title: 'Neural Core',
  description: 'Eval-first AI control plane for internal teams'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(1200px_420px_at_70%_-10%,rgba(34,211,238,0.08),transparent_50%),linear-gradient(180deg,#070b12_0%,#04070d_100%)] text-white">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
