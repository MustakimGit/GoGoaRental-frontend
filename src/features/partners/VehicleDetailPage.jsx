import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { errorMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentList, VehicleTitle } from '@/features/vehicles/VehicleSummary'
import useApiData from '@/hooks/useApiData'
import { partnerApi } from './api'
import AvailabilitySwitch from './AvailabilitySwitch'
import PartnerApprovalNotice from './PartnerApprovalNotice'
import UploadDocumentDialog from './UploadDocumentDialog'
import usePartnerApproved from './usePartnerApproved'
import VehicleCalendarCard from './VehicleCalendarCard'
import VehicleFormDialog from './VehicleFormDialog'

const availabilityText = {
  PendingVerification: 'Not bookable yet: waiting for all four documents to be verified.',
  Active: 'Live: customers can be assigned this vehicle.',
  Inactive: 'Paused: no new bookings will be assigned to this vehicle.',
  Retired: 'Retired: this vehicle is permanently out of service.',
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{value}</dd>
    </div>
  )
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const approved = usePartnerApproved()
  const [editing, setEditing] = useState(null)
  const [uploadTarget, setUploadTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data: vehicle, loading, error, setData } = useApiData(() => partnerApi.getVehicle(id), [id])

  const setStatus = async (status) => {
    if (status === 'Retired' && !window.confirm('Retire this vehicle permanently? This can’t be undone.')) return
    setBusy(true)
    try {
      setData(await partnerApi.setVehicleStatus(vehicle.partnerVehicleId, status))
      toast.success('Vehicle updated')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{error.status === 404 ? 'Vehicle not found.' : errorMessage(error)}</p>
      </section>
    )
  }
  if (loading && !vehicle) return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</p>

  const retired = vehicle.status === 'Retired'
  const canUpload = !retired

  return (
    <section className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <Link to="/partner/vehicles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> My vehicles
      </Link>
      <PartnerApprovalNotice />

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <VehicleTitle vehicle={vehicle} />
          {!retired && (
            <Button variant="outline" size="sm" onClick={() => setEditing(vehicle)} disabled={!approved}>
              Edit details
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm">{availabilityText[vehicle.status]}</p>
          <dl className="divide-y">
            <Row label="Vehicle type" value={vehicle.vehicleTypeName} />
            <Row label="Make and model" value={`${vehicle.make} ${vehicle.model}`} />
            <Row label="Year" value={vehicle.manufacturingYear} />
            <Row label="Based at" value={vehicle.pickupLocationName} />
            <Row label="Delivery radius" value={vehicle.deliveryRadiusKm > 0 ? `${vehicle.deliveryRadiusKm} km` : 'Pickup only'} />
          </dl>
          {!retired && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
              <AvailabilitySwitch vehicle={vehicle} onChange={setData} />
              <Button size="sm" variant="destructive" onClick={() => setStatus('Retired')} disabled={busy}>
                Retire vehicle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            All four must be verified before the vehicle goes live. Upload a new copy before one expires to stay live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList
            vehicle={vehicle}
            renderActions={(doc) => (
              <>
                <Button size="xs" variant="outline" asChild>
                  <a href={partnerApi.documentFileUrl(doc.vehicleDocumentId)} target="_blank" rel="noreferrer">
                    View
                  </a>
                </Button>
                {canUpload && vehicle.documents.find((d) => d.documentType === doc.documentType) === doc && (
                  <Button
                    size="xs"
                    variant={doc.verificationStatus === 'Verified' ? 'ghost' : 'default'}
                    onClick={() => setUploadTarget({ vehicleId: vehicle.partnerVehicleId, documentType: doc.documentType })}
                  >
                    {doc.verificationStatus === 'Verified' ? 'Renew' : 'Replace'}
                  </Button>
                )}
              </>
            )}
            renderMissing={(type) =>
              canUpload && (
                <Button size="xs" onClick={() => setUploadTarget({ vehicleId: vehicle.partnerVehicleId, documentType: type })}>
                  Upload
                </Button>
              )
            }
          />
        </CardContent>
      </Card>

      <VehicleCalendarCard vehicleId={vehicle.partnerVehicleId} disabled={retired} />

      <VehicleFormDialog vehicle={editing} onOpenChange={(open) => !open && setEditing(null)} onSaved={setData} />
      <UploadDocumentDialog target={uploadTarget} onClose={() => setUploadTarget(null)} onUploaded={setData} />
    </section>
  )
}
