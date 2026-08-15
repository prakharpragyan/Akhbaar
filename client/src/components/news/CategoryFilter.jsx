import { useDispatch, useSelector } from 'react-redux'
import { setCategory } from '../../redux/slices/newsSlice'
import { fetchNews } from '../../redux/slices/newsSlice'

// All available categories matching your backend / NewsAPI
const CATEGORIES = [
  { id: 'general',     label: 'Top Stories' },
  { id: 'technology',  label: 'Technology' },
  { id: 'business',    label: 'Business' },
  { id: 'science',     label: 'Science' },
  { id: 'health',      label: 'Health' },
  { id: 'sports',      label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
]

export default function CategoryFilter() {
  const dispatch       = useDispatch()
  const activeCategory = useSelector((state) => state.news.activeCategory)

  const handleSelect = (catId) => {
    // Update Redux state (what's active)
    dispatch(setCategory(catId))
    // Then fetch news for that category from backend
    dispatch(fetchNews(catId))
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === activeCategory
        return (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className={`
              flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium font-body
              transition-all duration-150 border
              ${isActive
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-ink-500 border-ink-100 hover:border-ink-200 hover:text-ink-700'
              }
            `}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
