import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/api/errors'
import PageHeader from '@/components/PageHeader'
import ReasonDialog from '@/components/ReasonDialog'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useApiData from '@/hooks/useApiData'
import { formatPhone, phoneHref } from '@/lib/format'
import { partnerStatusLabels } from '@/lib/labels'
import { adminApi } from './api'

const filters = [
  { value: 'PendingApproval', label: 'Awaiting approval' },
  { value: 'Active', label: 'Approved' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

function CommissionCell({ partner, onSaved }) {
  const [value, setValue] = useState(String(partner.commissionPercent))
  const dirty = Number(value) !== partner.commissionPercent

  const save = async () => {
    try {
      onSaved(await adminApi.setPartnerCommission(partner.rentalPartnerId, Number(value)))
      toast.success('Commission updated')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        min="0"
        max="100"
        step="0.5"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-20"
        aria-label={`Commission for ${partner.businessName}`}
      />
      <span className="text-sm text-muted-foreground">%</span>
      {dirty && (
        <Button size="xs" variant="outline" onClick={save}>
          Save
        </Button>
      )}
    </div>
  )
}

export default function PartnersPage() {
  const [filter, setFilter] = useState('PendingApproval')
  const [reasonRequest, setReasonRequest] = useState(null)
  const { data: partners, loading, error, setData } = useApiData(
    () => adminApi.listPartners(filter === 'all' ? null : filter),
    [filter],
  )

  const applyUpdate = (updated) => {
    setData((rows) =>
      rows
        .map((p) => (p.rentalPartnerId === updated.rentalPartnerId ? updated : p))
        // Drop rows that no longer match the current filter (e.g. approved from the pending list).
        .filter((p) => filter === 'all' || p.status === filter),
    )
  }

  const changeStatus = async (partner, status, reason) => {
    try {
      applyUpdate(await adminApi.changePartnerStatus(partner.rentalPartnerId, status, reason || null))
      toast.success(`${partner.businessName}: ${partnerStatusLabels[status].toLowerCase()}`)
    } catch (err) {
      toast.error(errorMessage(err))
      throw err
    }
  }

  const askReason = (partner, status, title, confirmLabel) =>
    setReasonRequest({
      title,
      description: partner.businessName,
      confirmLabel,
      required: false,
      onConfirm: (reason) => changeStatus(partner, status, reason),
    })

  const actionsFor = (partner) => {
    switch (partner.status) {
      case 'PendingApproval':
        return (
          <>
            <Button size="sm" onClick={() => changeStatus(partner, 'Active').catch(() => {})}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => askReason(partner, 'Rejected', 'Reject this partner?', 'Reject')}>
              Reject
            </Button>
          </>
        )
      case 'Active':
        return (
          <Button size="sm" variant="destructive" onClick={() => askReason(partner, 'Suspended', 'Suspend this partner?', 'Suspend')}>
            Suspend
          </Button>
        )
      default:
        return (
          <Button size="sm" variant="outline" onClick={() => changeStatus(partner, 'Active').catch(() => {})}>
            {partner.status === 'Suspended' ? 'Reactivate' : 'Approve'}
          </Button>
        )
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <PageHeader title="Rental partners" description="Approve new partners and manage existing ones." />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap">
          {filters.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="overflow-x-auto">
          {error ? (
            <p className="py-6 text-sm text-destructive">{errorMessage(error)}</p>
          ) : loading && !partners ? (
            <p className="py-6 text-sm text-muted-foreground">Loading…</p>
          ) : partners.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No partners here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Vehicles</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.rentalPartnerId}>
                    <TableCell>
                      <div className="font-medium">{p.businessName}</div>
                      {p.address && <div className="max-w-56 truncate text-xs text-muted-foreground">{p.address}</div>}
                    </TableCell>
                    <TableCell>
                      <div>{p.ownerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.email} ·{' '}
                        <a href={phoneHref(p.contactPhone)} className="whitespace-nowrap hover:text-foreground hover:underline">
                          {formatPhone(p.contactPhone)}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={p.status} labels={partnerStatusLabels} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.vehicleCount}</TableCell>
                    <TableCell>
                      <CommissionCell key={p.commissionPercent} partner={p} onSaved={applyUpdate} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">{actionsFor(p)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReasonDialog request={reasonRequest} onClose={() => setReasonRequest(null)} />
    </section>
  )
}
