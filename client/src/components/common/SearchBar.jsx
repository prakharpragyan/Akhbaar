import { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

// Debounced search bar component
// Props:
//   onSearch(query) — called after user stops typing for 500ms
//   loading        — shows spinner while results load
export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  // Debounce — wait 500ms after user stops typing
  // then call onSearch with the query
  // This prevents API call on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        onSearch(query.trim())
      } else if (query.trim().length === 0) {
        onSearch('')   // clear results when input is empty
      }
    }, 500)

    // Cleanup: cancel previous timer if user types again
    // This is the key to debouncing
    return () => clearTimeout(timer)
  }, [query])

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {loading
          ? <Loader2 size={15} className="text-ink-300 animate-spin" />
          : <Search size={15} className="text-ink-300" />
        }
      </div>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles..."
        className="
          w-full pl-9 pr-9 py-2.5 rounded-xl border border-ink-100
          bg-white text-sm font-body text-ink-900
          placeholder:text-ink-300
          focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10
          transition-all duration-150
        "
      />

      {/* Clear button */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}