// Work areas shown in the header and on the account page, by role.
export const navByRole = {
  Partner: [{ to: '/partner/vehicles', label: 'My vehicles' }],
  Admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/partners', label: 'Partners' },
    { to: '/admin/vehicles', label: 'Vehicle checks' },
    { to: '/admin/catalog', label: 'Catalog' },
    { to: '/admin/pricing', label: 'Pricing' },
  ],
}

// Where each role lands after logging in (when they weren't sent to log in from a specific page).
export const homeByRole = {
  Partner: '/partner/vehicles',
  Admin: '/admin/dashboard',
}
