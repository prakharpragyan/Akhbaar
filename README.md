# Akhbaar

A lightweight news aggregator with React frontend and Node/Express backend.

## Key Features
- Browse news feed with category filters
- Save bookmarks
- User authentication (register / login)
- AI-assisted features (server-side AI endpoints)

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- State: Redux
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)

## Repo Structure

client/ - React app (Vite)
server/ - Node/Express API

Source highlights:
- `client/src/pages` — app pages (Feed, Trending, Bookmarks, Auth)
- `client/src/components` — UI components
- `server/routes` — API route definitions
- `server/controllers` — request handlers
- `server/models` — Mongoose models

## Getting Started (Local)

Prerequisites:
- Node.js 18+ and npm
- MongoDB running locally or a MongoDB connection string

1. Clone the repo

```bash
git clone <your-repo-url>
cd Akhbaar
```

2. Install and run the server

```bash
cd server
npm install
# create a .env with MONGO_URI and JWT_SECRET
npm run dev
```

3. Install and run the client

```bash
cd ../client
npm install
npm run dev
```

Open the frontend URL printed by Vite (usually http://localhost:5173).

## Environment Variables

Server `.env` (example):

```
MONGO_URI=mongodb://localhost:27017/akhbaar
JWT_SECRET=your_jwt_secret
PORT=5000
```

## API Endpoints (overview)

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login
- `GET /api/news` — fetch news
- `GET /api/news/:id` — fetch single article
- `POST /api/ai/*` — AI-related endpoints

Refer to the route files in `server/routes` for full details.

## Contributing
- Fork, create a branch, make changes, open a PR.
- Please run the linters and test the app locally before submitting.

## License
MIT

## Contact
If you want help or want to report an issue, open a GitHub issue.
## Run from VS Code

You can run frontend and backend directly from VS Code using the included tasks and launch configurations.

- Run both at once: open Command Palette → `Tasks: Run Task` → select `Run All`.
- Or start them separately: Command Palette → `Tasks: Run Task` → `Start Server` or `Start Client`.

To use the debugger and open the client in a browser:

- Open the Run view (left sidebar) and start the `Run Full Stack` configuration.
	- This launches the Node server (uses `${workspaceFolder}/server/server.js`) and opens Chrome to the Vite URL.

If you prefer terminals, the equivalent commands are:

```powershell
# from workspace root
cd server
npm run dev

# in a second terminal
cd client
npm run dev
```

Notes:
- Ensure you have a `.env` file in `server/` with `MONGO_URI` and `JWT_SECRET` before starting the server.
- Vite usually serves the client at `http://localhost:5173`.
