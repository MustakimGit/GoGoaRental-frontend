import { ChevronRight, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { errorMessage } from '@/api/errors'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchCurrentUser } from '@/features/auth/authSlice'
import { VehicleTitle } from '@/features/vehicles/VehicleSummary'
import useApiData from '@/hooks/useApiData'
import { documentStatusLabels, requiredDocumentTypes } from '@/lib/labels'
import { partnerApi } from './api'
import AvailabilitySwitch from './AvailabilitySwitch'
import PartnerApprovalNotice from './PartnerApprovalNotice'
import usePartnerApproved from './usePartnerApproved'
import VehicleFormDialog from './VehicleFormDialog'

// Short hint on what the partner needs to do next for this vehicle.
function nextStep(vehicle) {
  if (vehicle.status === 'Retired' || vehicle.status === 'Inactive') return null
  const uploaded = new Set(vehicle.documents.map((d) => d.documentType))
  const missing = requiredDocumentTypes.filter((t) => !uploaded.has(t)).length
  if (missing) return `Upload ${missing} more document${missing > 1 ? 's' : ''}`
  if (vehicle.documentVerificationStatus === 'Rejected') return 'A document was rejected; upload a new copy'
  if (vehicle.documentVerificationStatus === 'Expired') return 'A document has expired; upload the current one'
  if (vehicle.documentVerificationStatus === 'Pending') return 'Waiting for admin checks'
  return null
}

export default function VehiclesPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const approved = usePartnerApproved()
  const [editing, setEditing] = useState(null)
  const { data: vehicles, loading, error, setData } = useApiData(partnerApi.listVehicles)
  const replaceVehicle = (updated) =>
    setData((list) => list.map((v) => (v.partnerVehicleId === updated.partnerVehicleId ? updated : v)))

  // Pick up an approval that happened since login.
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <section className="mx-auto grid max-w-4xl gap-6 px-4 py-10">
      <PageHeader
        title="My vehicles"
        description="Vehicles go live once their documents are verified. Use the switch to stop or resume bookings at any time."
        actions={
          <Button onClick={() => setEditing({})} disabled={!approved}>
            <Plus /> Add vehicle
          </Button>
        }
      />
      <PartnerApprovalNotice />

      {error ? (
        <p className="text-sm text-destructive">{errorMessage(error)}</p>
      ) : loading && !vehicles ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No vehicles yet.{approved && ' Add your first one to get started.'}
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {vehicles.map((v) => {
            const hint = nextStep(v)
            return (
              <li key={v.partnerVehicleId} className="overflow-hidden rounded-xl border bg-card">
                <Link
                  to={`/partner/vehicles/${v.partnerVehicleId}`}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="grid gap-2">
                    <VehicleTitle vehicle={v} />
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Documents:</span>
                      <StatusBadge
                        value={v.documentVerificationStatus}
                        labels={{ ...documentStatusLabels, Pending: 'In progress' }}
                      />
                      {hint && <span className="text-muted-foreground">· {hint}</span>}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
                {v.status !== 'Retired' && (
                  <div className="border-t bg-muted/30 px-4 py-2.5">
                    <AvailabilitySwitch vehicle={v} onChange={replaceVehicle} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <VehicleFormDialog
        vehicle={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={(saved) => navigate(`/partner/vehicles/${saved.partnerVehicleId}`)}
      />
    </section>
  )
}
