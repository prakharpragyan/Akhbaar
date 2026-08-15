# Akhbaar 2.0 – Frontend (Phase 1)

> AI-powered news intelligence platform built with React + Vite + Redux Toolkit

---

## Quick Start

```bash
cd akhbaar
npm install
cp .env.example .env        # fill in your backend URL
npm run dev                 # runs at http://localhost:5173
```

---

## Folder Structure Explained

```
src/
├── main.jsx                 # App entry point — mounts React + wraps with Redux Provider
├── App.jsx                  # Router — defines all pages and protected routes
├── index.css                # Global styles + Tailwind + animations
│
├── pages/                   # One file per screen/route
│   ├── LoginPage.jsx        # /login  — email/password form
│   ├── RegisterPage.jsx     # /register — 2-step signup with interest picker
│   └── FeedPage.jsx         # / (protected) — main news feed
│
├── components/
│   ├── layout/
│   │   └── Navbar.jsx       # Top bar shown on every feed page
│   ├── common/
│   │   ├── Input.jsx        # Reusable controlled input with label + error
│   │   └── Button.jsx       # Reusable button with loading spinner
│   └── news/
│       ├── NewsCard.jsx         # Single article card
│       ├── NewsCardSkeleton.jsx # Placeholder shown while loading
│       └── CategoryFilter.jsx   # Horizontal scrollable category pills
│
├── redux/
│   ├── store.js             # Creates the Redux store — combines all slices
│   └── slices/
│       ├── authSlice.js     # Manages: token, user, login/register async logic
│       └── newsSlice.js     # Manages: articles[], activeCategory, loading/error
│
└── services/
    └── api.js               # All Axios calls + JWT interceptor
```

---

## Key Concepts (say these in your interview)

### 1. Why Redux Toolkit?
Global state that multiple components need — like "is the user logged in?" or
"what articles are loaded?" — lives in Redux, not inside a component. This means
any component can read or update it without prop drilling.

### 2. What is a Redux Slice?
A slice = one feature's state + the reducers (functions that update it) + async
thunks (API calls). `authSlice.js` owns everything about authentication.
`newsSlice.js` owns everything about articles.

### 3. What is createAsyncThunk?
It handles the 3 states of an API call automatically:
- `pending`   → set loading = true
- `fulfilled` → save data to state
- `rejected`  → save error message to state
You never have to write try/catch loading logic in your component.

### 4. How does JWT auth work here?
1. User logs in → backend returns a JWT token
2. Frontend saves it to localStorage
3. Every subsequent API request attaches it as `Authorization: Bearer <token>`
4. Backend verifies the token before returning protected data
5. If token expires, the 401 interceptor in api.js logs the user out automatically

### 5. Why is api.js a separate file?
Single Responsibility Principle — all network calls live in one place.
If your backend URL changes, you update ONE file, not 20 components.
The Axios interceptor also auto-attaches the JWT to every request here.

### 6. What is a Protected Route?
In App.jsx, the `<PrivateRoute>` wrapper checks if a JWT token exists.
If not, it redirects to /login. This prevents unauthenticated users from
seeing the feed.

### 7. Skeleton Loading vs Spinner
A skeleton (NewsCardSkeleton.jsx) shows a shimmer placeholder that matches the
exact layout of the real card. It's better UX than a spinner because users
understand the content structure before it loads.

---

## Data Flow (trace this end-to-end in your interview)

```
User clicks "Sign in"
  → LoginPage calls dispatch(loginUser({ email, password }))
    → authSlice.js: loginUser thunk hits POST /api/auth/login via api.js
      → Backend validates credentials, returns { token, user }
        → authSlice saves token to Redux state + localStorage
          → App.jsx PrivateRoute sees token → renders FeedPage
            → FeedPage dispatches fetchNews('general')
              → newsSlice.js hits GET /api/news?category=general
                → Backend calls NewsAPI, returns articles[]
                  → Redux saves articles → NewsCard components render
```

---

## Environment Variables

| Variable        | Purpose                          |
|-----------------|----------------------------------|
| `VITE_API_URL`  | Your Express backend base URL    |

Vite exposes env vars via `import.meta.env.VITE_*`.
Never use `process.env` in Vite projects.

---

## Phase Roadmap

| Phase | Feature                          | Status      |
|-------|----------------------------------|-------------|
| 1     | Auth + News Feed                 | ✅ Built     |
| 2     | Personalization (preferences)    | 🔜 Next      |
| 3     | AI Summary / ELI5 / Sentiment    | 🔜 Planned   |
| 4     | Bookmarks + Search + Trending    | 🔜 Planned   |
| 5     | Recommendation Engine            | 🔜 Planned   |
| 6     | Deploy (Vercel + Render + Atlas) | 🔜 Planned   |

---

## Scripts

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build → /dist
npm run preview  # Preview production build locally
```
