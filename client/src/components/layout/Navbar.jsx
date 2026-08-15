import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { logout } from '../../redux/slices/authSlice'
import { Newspaper, Bookmark, TrendingUp, Settings, LogOut } from 'lucide-react'

export default function Navbar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user }   = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navLinks = [
    { path: '/',           label: 'Feed',      icon: Newspaper  },
    { path: '/trending',   label: 'Trending',  icon: TrendingUp },
    { path: '/bookmarks',  label: 'Bookmarks', icon: Bookmark   },
    { path: '/preferences',label: 'Interests', icon: Settings   },
  ]

  return (
    <header className="sticky top-0 z-50 bg-ink-50/90 backdrop-blur-sm border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Newspaper size={20} className="text-accent" />
          <span className="font-display text-xl font-bold tracking-tight text-ink-900">
            Akhbaar
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-ink-100 text-ink-900'
                    : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
                  }
                `}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-ink-400 font-body hidden sm:block">
              {user.name.split(' ')[0]}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-accent transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>

      </div>
    </header>
  )
}