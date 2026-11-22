import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * Asks for a short reason before a destructive admin action (reject, suspend).
 * `request` is { title, description, confirmLabel, required, onConfirm(reason) } or null when closed.
 */
export default function ReasonDialog({ request, onClose }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => {
    setReason('')
    onClose()
  }

  const confirm = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await request.onConfirm(reason.trim())
      close()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        {request && (
          <form onSubmit={confirm} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{request.title}</DialogTitle>
              {request.description && <DialogDescription>{request.description}</DialogDescription>}
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="reason">Reason{request.required ? '' : ' (optional)'}</Label>
              <Textarea id="reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={busy || (request.required && !reason.trim())}>
                {request.confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
