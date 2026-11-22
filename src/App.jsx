import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import CatalogPage from '@/features/admin/CatalogPage'
import DashboardPage from '@/features/admin/DashboardPage'
import PartnersPage from '@/features/admin/PartnersPage'
import PricingPage from '@/features/admin/PricingPage'
import VehicleReviewPage from '@/features/admin/VehicleReviewPage'
import { fetchCurrentUser } from '@/features/auth/authSlice'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import RequireAuth from '@/features/auth/RequireAuth'
import VehicleDetailPage from '@/features/partners/VehicleDetailPage'
import VehiclesPage from '@/features/partners/VehiclesPage'
import SearchPage from '@/features/search/SearchPage'
import CustomerLayout from '@/layouts/CustomerLayout'
import AccountPage from '@/pages/AccountPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'search', element: <SearchPage /> },
      {
        element: <RequireAuth />,
        children: [{ path: 'account', element: <AccountPage /> }],
      },
      {
        path: 'partner',
        element: <RequireAuth roles={['Partner']} />,
        children: [
          { path: 'vehicles', element: <VehiclesPage /> },
          { path: 'vehicles/:id', element: <VehicleDetailPage /> },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth roles={['Admin']} />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'partners', element: <PartnersPage /> },
          { path: 'vehicles', element: <VehicleReviewPage /> },
          { path: 'catalog', element: <CatalogPage /> },
          { path: 'pricing', element: <PricingPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  )
}
