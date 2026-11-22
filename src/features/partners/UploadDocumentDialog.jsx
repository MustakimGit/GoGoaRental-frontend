import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FormField from '@/features/auth/FormField'
import { documentNeedsExpiry, documentTypeLabels } from '@/lib/labels'
import { partnerApi } from './api'

const MAX_BYTES = 5 * 1024 * 1024

/** `target` is { vehicleId, documentType } while open, null when closed. */
export default function UploadDocumentDialog({ target, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [expiresOn, setExpiresOn] = useState('')
  const [fieldError, setFieldError] = useState({})
  const [busy, setBusy] = useState(false)
  const needsExpiry = target && documentNeedsExpiry(target.documentType)
  const [today] = useState(() => new Date().toLocaleDateString('en-CA')) // yyyy-mm-dd in local time

  const close = () => {
    setFile(null)
    setExpiresOn('')
    setFieldError({})
    onClose()
  }

  const submit = async (event) => {
    event.preventDefault()
    const errors = {}
    if (!file) errors.file = 'Choose a file'
    else if (file.size > MAX_BYTES) errors.file = 'Files must be 5 MB or smaller'
    if (needsExpiry && !expiresOn) errors.expiresOn = 'Enter the expiry date'
    setFieldError(errors)
    if (Object.keys(errors).length) return

    setBusy(true)
    try {
      const vehicle = await partnerApi.uploadDocument(target.vehicleId, {
        documentType: target.documentType,
        expiresOn: needsExpiry ? expiresOn : null,
        file,
      })
      toast.success('Uploaded. An admin will review it.')
      onUploaded(vehicle)
      close()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        {target && (
          <form onSubmit={submit} noValidate className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Upload {documentTypeLabels[target.documentType].toLowerCase()}</DialogTitle>
              <DialogDescription>A clear photo or scan. PDF, JPG or PNG, up to 5 MB.</DialogDescription>
            </DialogHeader>
            <FormField
              id="doc-file"
              label="File"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              error={fieldError.file}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {needsExpiry && (
              <FormField
                id="doc-expiry"
                label="Expires on"
                type="date"
                min={today}
                value={expiresOn}
                error={fieldError.expiresOn}
                onChange={(e) => setExpiresOn(e.target.value)}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Uploading…' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
