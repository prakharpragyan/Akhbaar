import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { newsAPI } from '../services/api'
import { TrendingUp, ExternalLink, Flame } from 'lucide-react'

export default function TrendingPage() {
  const navigate                = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await newsAPI.getTrending()
        setArticles(data.articles)
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6 fade-up">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 flex items-center gap-3">
            <Flame size={24} className="text-accent" />
            Trending
          </h1>
          <p className="text-sm text-ink-400 font-body mt-1">
            Most read articles right now
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-ink-100 h-20 skeleton" />
            ))}
          </div>
        )}

        {/* Trending list */}
        {!loading && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((article, i) => (
              <div
                key={article.url || i}
                className="bg-white rounded-2xl border border-ink-100 p-4 flex items-center gap-4 hover:border-ink-200 transition-all fade-up"
              >
                {/* Rank number */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-sm font-bold flex-shrink-0
                  ${i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-ink-100 text-ink-600' :
                    i === 2 ? 'bg-orange-50 text-orange-600' :
                    'bg-ink-50 text-ink-400'}
                `}>
                  {i + 1}
                </div>

                {/* Article info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 line-clamp-2 font-body leading-snug">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-ink-300">{article.source?.name}</span>
                    <span className="text-xs text-accent font-medium flex items-center gap-1">
                      <TrendingUp size={10} /> {article.clicks} reads
                    </span>
                  </div>
                </div>

                {/* Read link */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => newsAPI.trackClick(article.url).catch(() => {})}
                  className="flex-shrink-0 text-ink-300 hover:text-accent transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp size={40} className="text-ink-200 mb-4" />
            <p className="text-sm text-ink-400 font-body mb-4">
              No trending articles yet. Start reading!
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