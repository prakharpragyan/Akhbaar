import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import newsReducer from './slices/newsSlice'
import aiReducer from './slices/aiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    ai:   aiReducer,   
  },
})
