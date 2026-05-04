import './globals.css'
import { SiteFooter } from '../components/site-footer'
import { SiteHeader } from '../components/site-header'

export const metadata = {
  title: 'Aether Control - Enterprise AI Proxy',
  description: 'Eval-first AI control plane for internal teams'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen bg-black text-[#ededed] font-sans selection:bg-white selection:text-black">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
