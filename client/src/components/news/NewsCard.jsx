import { useState, useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import {
  ExternalLink, Clock, Building2,
  Sparkles, BookOpen, Loader2,
  Bookmark, BookmarkCheck
} from 'lucide-react'
import {
  summarizeArticle,
  explainArticle,
  sentimentArticle,
} from '../../redux/slices/aiSlice'
import { newsAPI } from '../../services/api'

// ─── Sentiment badge config ───────────────────────────────────────────────
const SENTIMENT_CONFIG = {
  positive: { label: '↑ Positive', bg: 'bg-green-50', text: 'text-green-700' },
  negative: { label: '↓ Negative', bg: 'bg-red-50',   text: 'text-red-700'   },
  neutral:  { label: '→ Neutral',  bg: 'bg-ink-100',  text: 'text-ink-500'   },
}

const CATEGORY_COLORS = {
  technology:    'bg-blue-50 text-blue-700',
  business:      'bg-amber-50 text-amber-700',
  sports:        'bg-green-50 text-green-700',
  politics:      'bg-red-50 text-red-700',
  science:       'bg-purple-50 text-purple-700',
  health:        'bg-teal-50 text-teal-700',
  entertainment: 'bg-pink-50 text-pink-700',
  general:       'bg-ink-100 text-ink-600',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 60)   return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

export default function NewsCard({ article, index = 0, initialBookmarked = false, onBookmarkToggle }) {
  const dispatch = useDispatch()

  // ── Scoped AI selector ─────────────────────────────────────────────────
  const aiState = useSelector((s) => ({
    result:            s.ai.results[article.url] || {},
    isLoadingSummary:   s.ai.loading[`${article.url}_summary`],
    isLoadingExplain:   s.ai.loading[`${article.url}_explain`],
    isLoadingSentiment: s.ai.loading[`${article.url}_sentiment`],
  }), shallowEqual)

  const {
    title, description, url,
    urlToImage, source, publishedAt,
    category = 'general',
  } = article

  // ── Local state ────────────────────────────────────────────────────────
  const [openPanel,      setOpenPanel]      = useState(null) // null | 'summary' | 'explain'
  const [bookmarked,     setBookmarked]     = useState(initialBookmarked || Boolean(article.isBookmarked || article.bookmarked))
  const [bookmarkLoading,setBookmarkLoading]= useState(false)

  // ── AI state from Redux ────────────────────────────────────────────────
  const results            = aiState.result
  const isLoadingSummary   = aiState.isLoadingSummary
  const isLoadingExplain   = aiState.isLoadingExplain
  const isLoadingSentiment = aiState.isLoadingSentiment

  const articleData = { title, description, url }

  // ── Auto fetch sentiment once, on mount ────────────────────────────────
  // Previously this ran from an inline callback ref (`ref={(el) => ...}`),
  // which React re-invokes on every render because the function is a new
  // reference each time — not just on mount. That fired a fresh sentiment
  // dispatch on every re-render of every visible card. useEffect with an
  // empty dependency array runs exactly once per mounted card instead.
  useEffect(() => {
    if (!results.sentiment && !isLoadingSentiment) {
      dispatch(sentimentArticle(articleData))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // ── AI button handlers ─────────────────────────────────────────────────
  const handleSummarize = () => {
    if (!results.summary && !isLoadingSummary) {
      dispatch(summarizeArticle(articleData))
    }
    setOpenPanel(openPanel === 'summary' ? null : 'summary')
  }

  const handleExplain = () => {
    if (!results.explanation && !isLoadingExplain) {
      dispatch(explainArticle(articleData))
    }
    setOpenPanel(openPanel === 'explain' ? null : 'explain')
  }

  // ── Bookmark handler ───────────────────────────────────────────────────
  const handleBookmark = async (e) => {
    e.preventDefault()
    setBookmarkLoading(true)
    try {
      const { data } = await newsAPI.toggleBookmark({
        url, title, description,
        urlToImage, source, publishedAt, category,
      })
      setBookmarked(data.bookmarked)
      if (onBookmarkToggle) onBookmarkToggle(data.bookmarked)
    } catch (err) {
      console.error('Bookmark failed:', err)
    }
    setBookmarkLoading(false)
  }

  // ── Track click when user reads article ───────────────────────────────
  const handleReadClick = () => {
    newsAPI.trackClick(url).catch(() => {}) // silent background call
  }

  const colorClass = CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.general
  const sentiment  = results.sentiment
  const sentConf   = sentiment ? SENTIMENT_CONFIG[sentiment] : null

  return (
    <article
      className={`
        group bg-white rounded-2xl border border-ink-100 overflow-hidden
        hover:border-ink-200 hover:shadow-sm transition-all duration-200
        fade-up fade-up-delay-${Math.min(index % 4 + 1, 4)}
      `}
    >
      {/* Thumbnail */}
      {urlToImage && (
        <div className="aspect-[16/9] overflow-hidden bg-ink-100">
          <img
            src={urlToImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )}

      <div className="p-5">

        {/* Category + Sentiment row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${colorClass}`}>
            {category}
          </span>

          {isLoadingSentiment && (
            <span className="text-[10px] text-ink-300 flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" /> analyzing...
            </span>
          )}
          {sentConf && !isLoadingSentiment && (
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${sentConf.bg} ${sentConf.text}`}>
              {sentConf.label}
            </span>
          )}
        </div>

        {/* Headline */}
        <h3 className="font-display font-semibold text-ink-900 leading-snug text-base mb-2 line-clamp-3">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-ink-500 leading-relaxed line-clamp-2 mb-4 font-body">
            {description}
          </p>
        )}

        {/* Meta + actions row */}
        <div className="flex items-center justify-between pt-3 border-t border-ink-50 mb-3">
          <div className="flex items-center gap-3 text-xs text-ink-300">
            {source?.name && (
              <span className="flex items-center gap-1">
                <Building2 size={11} /> {source.name}
              </span>
            )}
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {timeAgo(publishedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Read link — tracks click */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReadClick}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-dark transition-colors"
            >
              Read <ExternalLink size={11} />
            </a>

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className="text-ink-300 hover:text-accent transition-colors disabled:opacity-50 ml-1"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              {bookmarkLoading
                ? <Loader2 size={14} className="animate-spin" />
                : bookmarked
                  ? <BookmarkCheck size={15} className="text-accent" />
                  : <Bookmark size={15} />
              }
            </button>
          </div>
        </div>

        {/* AI Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSummarize}
            className={`
              flex-1 flex items-center justify-center gap-1.5
              text-xs font-medium py-2 rounded-lg border transition-all
              ${openPanel === 'summary'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-ink-50 border-ink-100 text-ink-500 hover:border-ink-200 hover:text-ink-700'
              }
            `}
          >
            {isLoadingSummary
              ? <Loader2 size={11} className="animate-spin" />
              : <Sparkles size={11} />
            }
            {isLoadingSummary ? 'Summarizing...' : 'AI Summary'}
          </button>

          <button
            onClick={handleExplain}
            className={`
              flex-1 flex items-center justify-center gap-1.5
              text-xs font-medium py-2 rounded-lg border transition-all
              ${openPanel === 'explain'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-ink-50 border-ink-100 text-ink-500 hover:border-ink-200 hover:text-ink-700'
              }
            `}
          >
            {isLoadingExplain
              ? <Loader2 size={11} className="animate-spin" />
              : <BookOpen size={11} />
            }
            {isLoadingExplain ? 'Explaining...' : 'ELI5'}
          </button>
        </div>

        {/* AI Result Panel */}
        {openPanel && (
          <div className={`
            mt-3 p-3 rounded-xl text-sm leading-relaxed font-body
            ${openPanel === 'summary'
              ? 'bg-amber-50 text-amber-900 border border-amber-100'
              : 'bg-blue-50 text-blue-900 border border-blue-100'
            }
          `}>
            {openPanel === 'summary' && (
              isLoadingSummary
                ? <span className="text-xs text-amber-400 flex items-center gap-2"><Loader2 size={11} className="animate-spin" /> Generating summary...</span>
                : <p className="whitespace-pre-line text-xs leading-relaxed">{results.summary}</p>
            )}
            {openPanel === 'explain' && (
              isLoadingExplain
                ? <span className="text-xs text-blue-400 flex items-center gap-2"><Loader2 size={11} className="animate-spin" /> Generating explanation...</span>
                : <p className="text-xs leading-relaxed">{results.explanation}</p>
            )}
          </div>
        )}

      </div>
    </article>
  )
}