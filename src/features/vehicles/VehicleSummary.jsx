import StatusBadge from '@/components/StatusBadge'
import { formatDate, formatRegistration } from '@/lib/format'
import { documentStatusLabels, documentTypeLabels, requiredDocumentTypes, vehicleStatusLabels } from '@/lib/labels'

export function VehicleTitle({ vehicle, showPartner = false }) {
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-base font-semibold tracking-wide">{formatRegistration(vehicle.registrationNumber)}</span>
        <StatusBadge value={vehicle.status} labels={vehicleStatusLabels} />
      </div>
      <p className="text-sm text-muted-foreground">
        {vehicle.make} {vehicle.model} ({vehicle.manufacturingYear}) · {vehicle.vehicleTypeName} · {vehicle.pickupLocationName}
        {showPartner && <> · <span className="text-foreground">{vehicle.businessName}</span></>}
      </p>
    </div>
  )
}

/**
 * One row per required document type: the newest upload of that type, plus older uploads collapsed below it.
 * `renderActions(doc)` adds buttons per upload (view, approve, ...).
 */
export function DocumentList({ vehicle, renderActions, renderMissing }) {
  return (
    <ul className="divide-y rounded-lg border">
      {requiredDocumentTypes.map((type) => {
        const docs = vehicle.documents.filter((d) => d.documentType === type) // newest first from the API
        const [latest, ...older] = docs
        return (
          <li key={type} className="grid gap-2 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{documentTypeLabels[type]}</span>
                {latest ? (
                  <span className="text-xs text-muted-foreground">
                    Uploaded {formatDate(latest.createdAt)}
                    {latest.expiresOn && <> · expires {formatDate(latest.expiresOn)}</>}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Not uploaded yet</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {latest ? (
                  <>
                    <StatusBadge value={latest.verificationStatus} labels={documentStatusLabels} />
                    {renderActions?.(latest)}
                  </>
                ) : (
                  renderMissing?.(type)
                )}
              </div>
            </div>
            {latest?.reviewNote && (
              <p className="rounded-md bg-muted px-2 py-1 text-xs">
                <span className="font-medium">Reviewer note:</span> {latest.reviewNote}
              </p>
            )}
            {older.length > 0 && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Earlier uploads ({older.length})</summary>
                <ul className="mt-1 grid gap-1">
                  {older.map((d) => (
                    <li key={d.vehicleDocumentId} className="flex flex-wrap items-center gap-2">
                      {formatDate(d.createdAt)} · <StatusBadge value={d.verificationStatus} labels={documentStatusLabels} />
                      {renderActions?.(d)}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        )
      })}
    </ul>
  )
}
