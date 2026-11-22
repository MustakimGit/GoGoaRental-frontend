import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'

const messages = {
  PendingApproval: 'Your partner account is awaiting approval. You can add vehicles once an admin approves it.',
  Suspended: 'Your partner account is suspended, so you can’t add or switch on vehicles. Contact support for help.',
  Rejected: 'Your partner application wasn’t approved. Contact support if you think this is a mistake.',
}

/** Explains why vehicle actions are unavailable. Renders nothing for an approved partner. */
export default function PartnerApprovalNotice() {
  const user = useSelector(selectCurrentUser)
  const message = messages[user?.partnerStatus]
  if (!message) return null
  return (
    <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      {message}
    </div>
  )
}
