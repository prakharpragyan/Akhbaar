import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, clearError } from '../redux/slices/authSlice'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { Newspaper } from 'lucide-react'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  // If already logged in, redirect to feed
  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  // Clear Redux error when user starts typing again
  useEffect(() => {
    if (error) dispatch(clearError())
  }, [form])

  // ── Client-side validation ────────────────────────────────────────────────
  // Always validate on the frontend before hitting the backend
  function validate() {
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    // Clear specific field error as user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setFieldErrors(errs)

    // Dispatch the async thunk — Redux handles pending/fulfilled/rejected
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">

      {/* ── Left panel: branding ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-ink-900 text-white p-12">
        <div className="flex items-center gap-2">
          <Newspaper size={22} className="text-accent" />
          <span className="font-display text-2xl font-bold">Akhbaar</span>
        </div>

        <div>
          <blockquote className="font-display text-3xl font-semibold leading-snug text-white/90 mb-6">
            "The news, summarized,<br />explained, and personalized<br />for you."
          </blockquote>
          <div className="flex gap-4 text-sm text-white/40">
            <span>AI Summaries</span>
            <span>·</span>
            <span>Sentiment Analysis</span>
            <span>·</span>
            <span>Personalized Feed</span>
          </div>
        </div>

        <p className="text-xs text-white/20">© 2026 Akhbaar. All rights reserved.</p>
      </div>

      {/* ── Right panel: form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Newspaper size={20} className="text-accent" />
            <span className="font-display text-xl font-bold text-ink-900">Akhbaar</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Welcome back</h1>
          <p className="text-sm text-ink-400 font-body mb-8">Sign in to your account</p>

          {/* Server-side error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400 font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
