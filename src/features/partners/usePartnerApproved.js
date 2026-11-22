import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'

export default function usePartnerApproved() {
  return useSelector(selectCurrentUser)?.partnerStatus === 'Active'
}
