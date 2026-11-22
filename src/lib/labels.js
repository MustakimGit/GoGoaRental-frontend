// Display text for the enum values the API sends (as names). Labels live only in the UI.

export const partnerStatusLabels = {
  PendingApproval: 'Awaiting approval',
  Active: 'Approved',
  Suspended: 'Suspended',
  Rejected: 'Rejected',
}

export const vehicleStatusLabels = {
  PendingVerification: 'Awaiting checks',
  Active: 'Live',
  Inactive: 'Paused',
  Retired: 'Retired',
}

export const documentStatusLabels = {
  Pending: 'Awaiting review',
  Verified: 'Verified',
  Rejected: 'Rejected',
  Expired: 'Expired',
}

export const documentTypeLabels = {
  RegistrationCertificate: 'Registration certificate (RC)',
  Insurance: 'Insurance',
  PollutionCertificate: 'Pollution certificate (PUC)',
  RentalPermit: 'Rental permit',
}

// Order matters: this is how documents are listed for a vehicle.
export const requiredDocumentTypes = ['RegistrationCertificate', 'Insurance', 'PollutionCertificate', 'RentalPermit']

// The RC has no expiry date; every other document needs one.
export const documentNeedsExpiry = (type) => type !== 'RegistrationCertificate'

// Whether a vehicle can be booked right now (admin dashboard), first failing reason otherwise.
export const availabilityLabels = {
  AvailableNow: 'Available now',
  BusyNow: 'Booked / blocked now',
  SwitchedOff: 'Switched off by partner',
  AwaitingChecks: 'Awaiting document checks',
  PartnerNotActive: 'Partner not approved',
  TypeDisabled: 'Vehicle type disabled',
  Retired: 'Retired',
}

// Badge tone per status value, shared across all the status kinds above.
export const statusTone = {
  AvailableNow: 'success',
  BusyNow: 'warning',
  SwitchedOff: 'muted',
  AwaitingChecks: 'warning',
  PartnerNotActive: 'danger',
  TypeDisabled: 'muted',
  Active: 'success',
  Verified: 'success',
  PendingApproval: 'warning',
  PendingVerification: 'warning',
  Pending: 'warning',
  Inactive: 'muted',
  Retired: 'muted',
  Suspended: 'danger',
  Rejected: 'danger',
  Expired: 'danger',
}
