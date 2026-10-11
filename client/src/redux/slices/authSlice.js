import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

// ─── Async Thunks ─────────────────────────────────────────────────────────
// ALL thunks must be defined BEFORE the slice that uses them

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(credentials)
      localStorage.setItem('akhbaar_token', data.token)
      localStorage.setItem('akhbaar_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(userData)
      localStorage.setItem('akhbaar_token', data.token)
      localStorage.setItem('akhbaar_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

// ← MUST be here, BEFORE the slice
export const updateUserPreferences = createAsyncThunk(
  'auth/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.updatePreferences(preferences)
      const cachedUser = JSON.parse(localStorage.getItem('akhbaar_user') || 'null')
      if (cachedUser) {
        localStorage.setItem('akhbaar_user', JSON.stringify({ ...cachedUser, preferences: data.preferences }))
      }
      return data.preferences
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update preferences')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.getMe()
      localStorage.setItem('akhbaar_user', JSON.stringify(data.user))
      return data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────
let initialUser = null
try {
  initialUser = JSON.parse(localStorage.getItem('akhbaar_user') || 'null')
} catch (e) {
  initialUser = null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    initialUser,
    token:   localStorage.getItem('akhbaar_token') || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null
      state.token = null
      localStorage.removeItem('akhbaar_token')
      localStorage.removeItem('akhbaar_user')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── LOGIN ──────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token   = action.payload.token
        state.user    = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── REGISTER ───────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.token   = action.payload.token
        state.user    = action.payload.user
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── UPDATE PREFERENCES ─────────────────────────────────────────────
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false
        if (state.user) state.user.preferences = action.payload
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── FETCH CURRENT USER ─────────────────────────────────────────────
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.token = null
        localStorage.removeItem('akhbaar_token')
        localStorage.removeItem('akhbaar_user')
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer