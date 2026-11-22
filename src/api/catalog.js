import apiClient from '@/api/client'

// Public catalog: only the vehicle types, models and pickup points that can currently be chosen.
export const catalogApi = {
  vehicleTypes: async () => (await apiClient.get('/catalog/vehicle-types')).data,
  vehicleModels: async () => (await apiClient.get('/catalog/vehicle-models')).data,
  pickupLocations: async () => (await apiClient.get('/catalog/pickup-locations')).data,
}
