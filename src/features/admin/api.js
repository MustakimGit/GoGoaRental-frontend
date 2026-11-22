import apiClient from '@/api/client'

const get = async (url, params) => (await apiClient.get(url, { params })).data
const post = async (url, body) => (await apiClient.post(url, body)).data
const put = async (url, body) => (await apiClient.put(url, body)).data

export const adminApi = {
  dashboard: () => get('/admin/dashboard'),

  listPartners: (status) => get('/admin/partners', status ? { status } : undefined),
  changePartnerStatus: (id, status, reason) => put(`/admin/partners/${id}/status`, { status, reason }),
  setPartnerCommission: (id, commissionPercent) => put(`/admin/partners/${id}/commission`, { commissionPercent }),

  listCategories: () => get('/admin/vehicle-categories'),
  createCategory: (body) => post('/admin/vehicle-categories', body),
  updateCategory: (id, body) => put(`/admin/vehicle-categories/${id}`, body),

  listVehicleTypes: () => get('/admin/vehicle-types'),
  createVehicleType: (body) => post('/admin/vehicle-types', body),
  updateVehicleType: (id, body) => put(`/admin/vehicle-types/${id}`, body),

  listVehicleModels: () => get('/admin/vehicle-models'),
  createVehicleModel: (body) => post('/admin/vehicle-models', body),
  updateVehicleModel: (id, body) => put(`/admin/vehicle-models/${id}`, body),

  listPickupLocations: () => get('/admin/pickup-locations'),
  createPickupLocation: (body) => post('/admin/pickup-locations', body),
  updatePickupLocation: (id, body) => put(`/admin/pickup-locations/${id}`, body),

  listPrices: () => get('/admin/prices'),
  createPrice: (body) => post('/admin/prices', body),
  withdrawPrice: async (id) => (await apiClient.delete(`/admin/prices/${id}`)).data,

  listVehicles: (needsReview) => get('/admin/vehicles', { needsReview }),
  reviewDocument: (documentId, approve, reason) => put(`/admin/vehicle-documents/${documentId}/review`, { approve, reason }),
  documentFileUrl: (documentId) => `/api/admin/vehicle-documents/${documentId}/file`,
}
