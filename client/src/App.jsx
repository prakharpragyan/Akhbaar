import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import FeedPage        from './pages/FeedPage'
import PreferencesPage from './pages/PreferencesPage'
import BookmarksPage   from './pages/BookmarksPage'
import TrendingPage    from './pages/TrendingPage'

// Protected route wrapper — redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />}    />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute><FeedPage /></PrivateRoute>
        } />
        <Route path="/preferences" element={
          <PrivateRoute><PreferencesPage /></PrivateRoute>
        } />
        <Route path="/bookmarks" element={
          <PrivateRoute><BookmarksPage /></PrivateRoute>
        } />
        <Route path="/trending" element={
          <PrivateRoute><TrendingPage /></PrivateRoute>
        } />

        {/* Catch-all — MUST be last */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}