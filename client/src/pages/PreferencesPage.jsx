import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUserPreferences } from '../redux/slices/authSlice'
import Navbar from '../components/layout/Navbar'
import Button from '../components/common/Button'
import { Check } from 'lucide-react'

const ALL_INTERESTS = [
  { id: 'technology',    label: '💻 Technology' },
  { id: 'business',      label: '📈 Business' },
  { id: 'science',       label: '🔬 Science' },
  { id: 'health',        label: '🏥 Health' },
  { id: 'sports',        label: '⚽ Sports' },
  { id: 'entertainment', label: '🎬 Entertainment' },
  { id: 'general',       label: '🌍 Top Stories' },
]

export default function PreferencesPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, loading } = useSelector((s) => s.auth)

  // Initialize with user's current preferences
  const [selected, setSelected] = useState(user?.preferences || [])
  const [saved, setSaved]       = useState(false)

  const toggle = (id) => {
    setSaved(false)
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (selected.length === 0) return alert('Please select at least one interest')
    const result = await dispatch(updateUserPreferences(selected))
    if (updateUserPreferences.fulfilled.match(result)) {
      setSaved(true)
      // Go back to feed after 1 second
      setTimeout(() => navigate('/'), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="fade-up">
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">
            Your Interests
          </h1>
          <p className="text-sm text-ink-400 font-body mb-8">
            Select the topics you want to see in your feed.
            Pick as many as you like.
          </p>

          {/* Interest grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {ALL_INTERESTS.map((interest) => {
              const isSelected = selected.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  onClick={() => toggle(interest.id)}
                  className={`
                    flex items-center justify-between px-4 py-4
                    rounded-xl border text-sm font-medium font-body
                    transition-all duration-150 text-left
                    ${isSelected
                      ? 'bg-accent/5 border-accent text-accent'
                      : 'bg-white border-ink-100 text-ink-600 hover:border-ink-200'
                    }
                  `}
                >
                  <span>{interest.label}</span>
                  {isSelected && (
                    <Check size={15} className="text-accent flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected count */}
          <p className="text-xs text-ink-300 font-body text-center mb-4">
            {selected.length} topic{selected.length !== 1 ? 's' : ''} selected
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={handleSave}
              className="flex-1"
            >
              {saved ? '✓ Saved!' : 'Save Interests'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}