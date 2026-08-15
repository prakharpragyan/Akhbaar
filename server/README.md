# Akhbaar 2.0 — Backend (Phase 1)

> Node.js + Express + MongoDB REST API with JWT Authentication

---

## Quick Start

```bash
cd server
npm install
cp .env.example .env       # fill in your real values
npm run dev                # runs with nodemon at http://localhost:5000
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint              | Body                              | Returns          |
|--------|-----------------------|-----------------------------------|------------------|
| POST   | `/api/auth/register`  | `{ name, email, password, preferences[] }` | `{ token, user }` |
| POST   | `/api/auth/login`     | `{ email, password }`             | `{ token, user }` |
| GET    | `/api/auth/me`        | — (JWT in header)                 | `{ user }`       |

### News (Protected — JWT required)
| Method | Endpoint              | Query               | Returns           |
|--------|-----------------------|---------------------|-------------------|
| GET    | `/api/news`           | `?category=tech`    | `{ articles[] }`  |

### Health
| Method | Endpoint          | Returns                  |
|--------|-------------------|--------------------------|
| GET    | `/api/health`     | `{ message, timestamp }` |

---

## Folder Structure Explained

```
server/
├── server.js                 # App entry: Express setup, middleware, routes
├── package.json              # Dependencies
├── .env                      # Secrets (never commit)
│
├── config/
│   └── db.js                 # MongoDB connection via Mongoose
│
├── models/                   # Mongoose schemas (DB shape)
│   ├── User.model.js         # User schema + password hashing hook
│   └── News.model.js         # News cache schema
│
├── controllers/              # Business logic for each route
│   ├── auth.controller.js    # register, login, getMe
│   └── news.controller.js    # getNews
│
├── routes/                   # URL → controller mapping
│   ├── auth.routes.js        # /api/auth/*
│   └── news.routes.js        # /api/news
│
├── middleware/
│   ├── auth.middleware.js    # JWT verification (protect)
│   └── error.middleware.js   # Global error handler
│
├── services/
│   ├── news.service.js       # NewsAPI calls + 30-min caching
│   └── ai.service.js         # Placeholder for Phase 3 AI
│
└── utils/
    └── generateToken.js      # Creates signed JWT
```

---

## Key Concepts for Interview

### 1. MVC Pattern (Model-View-Controller)
- **Model** = `models/` — defines data shape in MongoDB
- **Controller** = `controllers/` — handles request/response logic
- **Routes** = `routes/` — maps URLs to controllers
- There's no "View" because React is the view layer (separate project)

### 2. JWT Flow (trace this end-to-end)
```
User registers/logs in
  → controller creates user in MongoDB
    → generateToken(user._id) creates signed JWT
      → JWT sent to frontend
        → Frontend stores in localStorage
          → Every request: Authorization: Bearer <token>
            → protect middleware verifies token
              → req.user = found user
                → controller can use req.user
```

### 3. Password Security
- Passwords are NEVER stored as plain text
- `bcryptjs` hashes the password with 12 salt rounds in the pre-save hook
- On login, `bcrypt.compare()` checks plain vs hash — the plain text is never stored

### 4. Caching Strategy
- NewsAPI free tier = 100 requests/day
- news.service.js checks MongoDB first before calling NewsAPI
- If cached data is < 30 minutes old, return it directly
- If stale, fetch fresh data, save to MongoDB, return it

### 5. Separation of Concerns
- Routes only map URLs to controllers — no logic
- Controllers only handle req/res — no DB queries
- Services handle business logic (API calls, caching)
- Models define shape — no logic except hooks

---

## Environment Variables

| Variable        | Where to get it                        |
|-----------------|----------------------------------------|
| `MONGO_URI`     | MongoDB Atlas → Connect → Drivers      |
| `JWT_SECRET`    | Run: `openssl rand -base64 64`         |
| `NEWS_API_KEY`  | https://newsapi.org (free tier)        |
| `PORT`          | Default: 5000                          |
| `CLIENT_URL`    | Your Vercel URL in production          |

---

## Test the API (without frontend)

Once running, test with curl or Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul","email":"rahul@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@test.com","password":"password123"}'

# Get news (replace TOKEN with the token from login response)
curl http://localhost:5000/api/news?category=technology \
  -H "Authorization: Bearer TOKEN"
```
