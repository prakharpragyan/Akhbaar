import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import NewsCard from '../components/news/NewsCard'
import { newsAPI } from '../services/api'

import { Bookmark } from 'lucide-react'

export default function BookmarksPage() {
  const navigate              = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await newsAPI.getBookmarks()
        setBookmarks(data.bookmarks)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6 fade-up">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 flex items-center gap-3">
            <Bookmark size={24} className="text-accent" />
            Bookmarks
          </h1>
          <p className="text-sm text-ink-400 font-body mt-1">
            {bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-ink-100 h-64 skeleton" />
            ))}
          </div>
        )}

        {/* Bookmarks grid */}
        {!loading && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((article, i) => (
              <NewsCard key={article.url || i} article={article} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark size={40} className="text-ink-200 mb-4" />
            <p className="text-sm text-ink-400 font-body mb-4">
              No bookmarks yet. Save articles from your feed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-accent font-medium hover:underline"
            >
              Go to feed →
            </button>
          </div>
        )}

      </main>
    </div>
  )
}