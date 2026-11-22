import apiClient from '@/api/client'

export const partnerApi = {
  listVehicles: async () => (await apiClient.get('/partner/vehicles')).data,
  getVehicle: async (id) => (await apiClient.get(`/partner/vehicles/${id}`)).data,
  createVehicle: async (body) => (await apiClient.post('/partner/vehicles', body)).data,
  updateVehicle: async (id, body) => (await apiClient.put(`/partner/vehicles/${id}`, body)).data,
  setVehicleStatus: async (id, status) => (await apiClient.put(`/partner/vehicles/${id}/status`, { status })).data,

  uploadDocument: async (vehicleId, { documentType, expiresOn, file }) => {
    const form = new FormData()
    form.append('documentType', documentType)
    if (expiresOn) form.append('expiresOn', expiresOn)
    form.append('file', file)
    // Let the browser set the multipart boundary; the client's default is JSON.
    const { data } = await apiClient.post(`/partner/vehicles/${vehicleId}/documents`, form, {
      headers: { 'Content-Type': undefined },
      timeout: 60000,
    })
    return data
  },
  documentFileUrl: (documentId) => `/api/partner/documents/${documentId}/file`,

  listCalendar: async (vehicleId) => (await apiClient.get(`/partner/vehicles/${vehicleId}/calendar`)).data,
  addCalendarBlock: async (vehicleId, body) => (await apiClient.post(`/partner/vehicles/${vehicleId}/calendar`, body)).data,
  removeCalendarBlock: async (blockId) => apiClient.delete(`/partner/calendar/${blockId}`),
}
