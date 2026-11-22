import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '@/api/client'

// status: 'idle' until the first /me check, then 'checked'. Routes wait for 'checked' before redirecting.
const initialState = { user: null, status: 'idle' }

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  try {
    const { data } = await apiClient.get('/auth/me')
    return data
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
})

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/login', credentials)
    return data
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const registerCustomer = createAsyncThunk('auth/registerCustomer', async (form, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/register', form)
    return data
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const registerPartner = createAsyncThunk('auth/registerPartner', async (form, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/register-partner', form)
    return data
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiClient.post('/auth/logout')
})

const setUser = (state, action) => {
  state.user = action.payload
  state.status = 'checked'
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, setUser)
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'checked'
      })
      .addCase(login.fulfilled, setUser)
      .addCase(registerCustomer.fulfilled, setUser)
      .addCase(registerPartner.fulfilled, setUser)
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const selectCurrentUser = (state) => state.auth.user
export const selectAuthChecked = (state) => state.auth.status === 'checked'

export default authSlice.reducer
