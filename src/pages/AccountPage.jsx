import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { formatPhone } from '@/lib/format'
import { navByRole } from '@/lib/navigation'

const roleLabels = {
  Customer: 'Customer',
  Partner: 'Rental partner',
  Admin: 'Admin',
}

const partnerStatusText = {
  PendingApproval: { label: 'Awaiting approval', note: 'An admin will review your application. You can add vehicles once approved.' },
  Active: { label: 'Approved', note: 'Your business can receive bookings.' },
  Suspended: { label: 'Suspended', note: 'Contact support to restore your account.' },
  Rejected: { label: 'Not approved', note: 'Contact support if you think this is a mistake.' },
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 break-words">{value || '—'}</dd>
    </div>
  )
}

export default function AccountPage() {
  const user = useSelector(selectCurrentUser)
  const partner = user.rentalPartnerId ? partnerStatusText[user.partnerStatus] : null

  return (
    <section className="mx-auto grid max-w-2xl gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Hi, {user.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>
            <Badge variant="secondary">{roleLabels[user.role] ?? user.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Mobile" value={formatPhone(user.phone)} />
          </dl>
        </CardContent>
      </Card>

      {navByRole[user.role] && (
        <div className="flex flex-wrap gap-2">
          {navByRole[user.role].map((l) => (
            <Button key={l.to} variant="outline" asChild>
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
        </div>
      )}

      {partner && (
        <Card>
          <CardHeader>
            <CardTitle>{user.businessName}</CardTitle>
            <CardDescription>
              <Badge variant={user.partnerStatus === 'Active' ? 'default' : 'outline'}>{partner.label}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{partner.note}</p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
