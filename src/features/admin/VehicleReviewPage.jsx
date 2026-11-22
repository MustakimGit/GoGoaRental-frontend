import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/api/errors'
import PageHeader from '@/components/PageHeader'
import ReasonDialog from '@/components/ReasonDialog'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentList, VehicleTitle } from '@/features/vehicles/VehicleSummary'
import useApiData from '@/hooks/useApiData'
import { documentStatusLabels, documentTypeLabels } from '@/lib/labels'
import { adminApi } from './api'

export default function VehicleReviewPage() {
  const [view, setView] = useState('review')
  const [reasonRequest, setReasonRequest] = useState(null)
  const { data: vehicles, loading, error, setData } = useApiData(() => adminApi.listVehicles(view === 'review'), [view])

  const applyUpdate = (updated) => {
    setData((rows) => {
      const next = rows.map((v) => (v.partnerVehicleId === updated.partnerVehicleId ? updated : v))
      // In the review queue, drop vehicles once nothing is left to review.
      return view === 'review' ? next.filter((v) => v.documents.some((d) => d.verificationStatus === 'Pending')) : next
    })
  }

  const review = async (doc, approve, reason) => {
    try {
      const updated = await adminApi.reviewDocument(doc.vehicleDocumentId, approve, reason || null)
      applyUpdate(updated)
      toast.success(
        approve && updated.status === 'Active'
          ? `${updated.registrationNumber} is now live`
          : `${documentTypeLabels[doc.documentType]} ${approve ? 'verified' : 'rejected'}`,
      )
    } catch (err) {
      toast.error(errorMessage(err))
      throw err
    }
  }

  const actions = (doc) => (
    <>
      <Button size="xs" variant="outline" asChild>
        <a href={adminApi.documentFileUrl(doc.vehicleDocumentId)} target="_blank" rel="noreferrer">
          View
        </a>
      </Button>
      {doc.verificationStatus === 'Pending' && (
        <>
          <Button size="xs" onClick={() => review(doc, true).catch(() => {})}>
            Verify
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() =>
              setReasonRequest({
                title: `Reject ${documentTypeLabels[doc.documentType].toLowerCase()}?`,
                description: 'The partner sees this reason and can upload a new copy.',
                confirmLabel: 'Reject',
                required: true,
                onConfirm: (reason) => review(doc, false, reason),
              })
            }
          >
            Reject
          </Button>
        </>
      )}
    </>
  )

  return (
    <section className="mx-auto grid max-w-4xl gap-6 px-4 py-10">
      <PageHeader
        title="Vehicle checks"
        description="Open each document, check it matches the vehicle, then verify or reject it. A vehicle goes live once all four are verified."
      />

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="review">Needs review</TabsTrigger>
          <TabsTrigger value="all">All vehicles</TabsTrigger>
        </TabsList>
      </Tabs>

      {error ? (
        <p className="text-sm text-destructive">{errorMessage(error)}</p>
      ) : loading && !vehicles ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {view === 'review' ? 'Nothing waiting for review.' : 'No vehicles listed yet.'}
          </CardContent>
        </Card>
      ) : (
        vehicles.map((v) => (
          <Card key={v.partnerVehicleId}>
            <CardHeader className="flex flex-wrap items-start justify-between gap-2">
              <VehicleTitle vehicle={v} showPartner />
              <StatusBadge value={v.documentVerificationStatus} labels={{ ...documentStatusLabels, Pending: 'Documents incomplete' }} />
            </CardHeader>
            <CardContent>
              <DocumentList vehicle={v} renderActions={actions} />
            </CardContent>
          </Card>
        ))
      )}

      <ReasonDialog request={reasonRequest} onClose={() => setReasonRequest(null)} />
    </section>
  )
}
