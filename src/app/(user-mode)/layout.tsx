import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AdBanner } from "@/components/layout/AdBanner"

export default function UserModeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdBanner />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}