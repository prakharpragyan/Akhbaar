import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchNews,
  fetchPersonalizedNews,
  fetchRecommendations
} from '../redux/slices/newsSlice'
import Navbar from '../components/layout/Navbar'
import CategoryFilter from '../components/news/CategoryFilter'
import NewsCard from '../components/news/NewsCard'
import NewsCardSkeleton from '../components/news/NewsCardSkeleton'
import SearchBar from '../components/common/SearchBar'
import { newsAPI } from '../services/api'
import { AlertCircle, RefreshCw, Sparkles, Globe, Zap } from 'lucide-react'

export default function FeedPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const { articles, loading, error, activeCategory, basedOn } = useSelector((s) => s.news)

  // ── Tab state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('foryou')

  // ── Search state ───────────────────────────────────────────────────────
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [isSearching,   setIsSearching]   = useState(false)

  // Load personalized feed on first render
  useEffect(() => {
    dispatch(fetchPersonalizedNews())
  }, [])

  // ── Tab switch handler ─────────────────────────────────────────────────
  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setIsSearching(false)
    setSearchResults([])
    if (tab === 'foryou') {
      dispatch(fetchPersonalizedNews())
    } else if (tab === 'recommended') {
      dispatch(fetchRecommendations())
    } else {
      dispatch(fetchNews('general'))
    }
  }

  // ── Search handler ─────────────────────────────────────────────────────
  const handleSearch = async (query) => {
    if (!query) {
      setIsSearching(false)
      setSearchResults([])
      return
    }
    setIsSearching(true)
    setSearchLoading(true)
    try {
      const { data } = await newsAPI.searchNews(query)
      setSearchResults(data.articles)
    } catch (err) {
      console.error('Search failed:', err)
    }
    setSearchLoading(false)
  }

  // ── Retry handler ──────────────────────────────────────────────────────
  const handleRetry = () => {
    if (activeTab === 'foryou')           dispatch(fetchPersonalizedNews())
    else if (activeTab === 'recommended') dispatch(fetchRecommendations())
    else                                  dispatch(fetchNews(activeCategory))
  }

  // ── Greeting ───────────────────────────────────────────────────────────
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Articles to display
  const displayArticles = isSearching ? searchResults : articles

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6 fade-up flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-sm text-ink-400 font-body mt-1">
              {isSearching
                ? `${searchResults.length} search results`
                : activeTab === 'foryou'
                  ? `Your personalized feed · ${articles.length} articles`
                  : activeTab === 'recommended'
                    ? `Based on your reading: ${basedOn?.join(', ')}`
                    : 'Browsing all news'
              }
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-5 fade-up fade-up-delay-1">
          <SearchBar onSearch={handleSearch} loading={searchLoading} />
        </div>

        {/* Tabs — hidden when searching */}
        {!isSearching && (
          <div className="flex gap-1 mb-6 bg-ink-100 p-1 rounded-xl w-fit fade-up fade-up-delay-2">
            <button
              onClick={() => handleTabSwitch('foryou')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'foryou'
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'}`}
            >
              <Sparkles size={14} /> For You
            </button>

            <button
              onClick={() => handleTabSwitch('recommended')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'recommended'
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'}`}
            >
              <Zap size={14} /> Recommended
            </button>

            <button
              onClick={() => handleTabSwitch('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'all'
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'}`}
            >
              <Globe size={14} /> All News
            </button>
          </div>
        )}

        {/* Recommended banner — shows what categories engine picked */}
        {activeTab === 'recommended' && !isSearching && basedOn?.length > 0 && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 fade-up">
            <p className="text-xs font-medium text-accent flex items-center gap-2">
              <Zap size={12} />
              Recommended based on your reading history:
              {basedOn.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize"
                >
                  {cat}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Category filter — only on All News tab */}
        {activeTab === 'all' && !isSearching && (
          <div className="mb-6 fade-up fade-up-delay-3">
            <CategoryFilter />
          </div>
        )}

        {/* Error state */}
        {error && !loading && !isSearching && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={36} className="text-ink-200 mb-3" />
            <p className="text-sm text-ink-500 font-body mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 text-sm text-accent font-medium hover:underline"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && !isSearching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Articles grid */}
        {(!loading || isSearching) && !error && displayArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayArticles.map((article, i) => (
              <NewsCard key={article.url || i} article={article} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayArticles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-4">
              {isSearching ? '🔍' : activeTab === 'recommended' ? '⚡' : '📭'}
            </p>
            <p className="text-sm text-ink-400 font-body mb-3">
              {isSearching
                ? 'No articles found for your search'
                : activeTab === 'recommended'
                  ? 'Start reading articles to get recommendations'
                  : 'No articles found'
              }
            </p>
            {!isSearching && activeTab !== 'recommended' && (
              <button
                onClick={() => navigate('/preferences')}
                className="text-sm text-accent font-medium hover:underline"
              >
                Update your interests →
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  )
}