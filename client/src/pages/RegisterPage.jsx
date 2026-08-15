import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, clearError } from '../redux/slices/authSlice'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { Newspaper, Check } from 'lucide-react'

// Interest categories user can pick at signup
// These get saved to User.preferences in MongoDB
const INTERESTS = [
  { id: 'technology',    label: '💻 Technology' },
  { id: 'business',      label: '📈 Business' },
  { id: 'science',       label: '🔬 Science' },
  { id: 'health',        label: '🏥 Health' },
  { id: 'sports',        label: '⚽ Sports' },
  { id: 'entertainment', label: '🎬 Entertainment' },
  { id: 'politics',      label: '🏛️ Politics' },
  { id: 'world',         label: '🌍 World' },
]

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [preferences, setPreferences] = useState([]) // selected interest IDs
  const [fieldErrors, setFieldErrors] = useState({})
  const [step, setStep] = useState(1) // step 1 = details, step 2 = interests

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  useEffect(() => {
    if (error) dispatch(clearError())
  }, [form, preferences])

  function validate() {
    const errs = {}
    if (!form.name.trim())  errs.name     = 'Name is required'
    if (!form.email)        errs.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password)     errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters'
    return errs
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const toggleInterest = (id) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  // Step 1: validate form fields, then move to interest selection
  const handleNext = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setFieldErrors(errs)
    setStep(2)
  }

  // Step 2: submit everything to backend
  const handleSubmit = async () => {
    const result = await dispatch(registerUser({ ...form, preferences }))
    if (registerUser.fulfilled.match(result)) navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-ink-900 text-white p-12">
        <div className="flex items-center gap-2">
          <Newspaper size={22} className="text-accent" />
          <span className="font-display text-2xl font-bold">Akhbaar</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold leading-snug text-white/90 mb-4">
            Personalized news,<br />powered by AI.
          </h2>
          <ul className="space-y-2 text-sm text-white/50">
            {['Pick your interests', 'Get a tailored feed', 'AI summaries on demand', 'Bookmark & revisit'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check size={13} className="text-accent" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/20">© 2026 Akhbaar. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Newspaper size={20} className="text-accent" />
            <span className="font-display text-xl font-bold text-ink-900">Akhbaar</span>
          </div>

          {/* ── STEP 1: Account details ───────────────────────────────── */}
          {step === 1 && (
            <>
              <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Create account</h1>
              <p className="text-sm text-ink-400 font-body mb-8">Step 1 of 2 — Your details</p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleNext} noValidate className="space-y-4">
                <Input
                  label="Full name"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  autoComplete="name"
                />
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
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  autoComplete="new-password"
                />
                <Button type="submit" className="w-full mt-2">
                  Continue →
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-400 font-body">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* ── STEP 2: Interest selection ────────────────────────────── */}
          {step === 2 && (
            <>
              <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Your interests</h1>
              <p className="text-sm text-ink-400 font-body mb-6">
                Step 2 of 2 — Pick topics for your personalized feed
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Interest grid */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {INTERESTS.map((interest) => {
                  const selected = preferences.includes(interest.id)
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl border text-sm
                        font-body font-medium transition-all duration-150
                        ${selected
                          ? 'bg-accent/5 border-accent text-accent'
                          : 'bg-white border-ink-100 text-ink-600 hover:border-ink-200'
                        }
                      `}
                    >
                      <span>{interest.label}</span>
                      {selected && <Check size={14} className="text-accent flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                  ← Back
                </Button>
                <Button
                  loading={loading}
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  Create account
                </Button>
              </div>

              <p className="mt-3 text-center text-xs text-ink-300 font-body">
                You can update these anytime in settings
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
