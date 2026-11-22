import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router'
import { selectAuthChecked, selectCurrentUser } from './authSlice'

// Guards child routes. With `roles`, a logged-in user without one of those roles is sent to their account page.
export default function RequireAuth({ roles }) {
  const user = useSelector(selectCurrentUser)
  const checked = useSelector(selectAuthChecked)
  const location = useLocation()

  if (!checked) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/account" replace />
  return <Outlet />
}
