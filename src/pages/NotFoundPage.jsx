import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { LOGO_URL } from '@/lib/brand'

export default function NotFoundPage() {
  return (
    <section className="mx-auto grid max-w-6xl justify-items-center px-4 py-20 text-center">
      <img src={LOGO_URL} alt="" className="size-32 animate-float rounded-3xl bg-white object-contain p-2 shadow-xl ring-1 ring-black/5" />
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Looks like you took a wrong turn</h1>
      <p className="mt-2 text-muted-foreground">We couldn’t find that page.</p>
      <Button size="lg" className="mt-6 h-11 rounded-full px-6" asChild>
        <Link to="/">
          <ArrowLeft /> Back to home
        </Link>
      </Button>
    </section>
  )
}
