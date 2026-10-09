# My-Portifollow

Full-stack developer website portfolio.

## Project structure

- `frontend/` contains the React and Vite website.
- `backend/` contains the Node.js API, database code, and backend environment settings.

## Run locally

1. Install Node.js.
2. In the project root, run `npm install`.
3. Copy `backend/.env.example` to `backend/.env` and set a unique admin username and strong password.
4. Run `npm run dev` in the project root. The website runs at `http://localhost:3000` and the API at `http://localhost:5001`.
5. Open `http://localhost:3000/admin` to sign in to the dashboard.

You can also start the frontend or backend separately from its directory with `npm run dev`.

## Admin login

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `backend/.env` or your backend deployment environment before the first admin login. Use a unique, strong password and do not commit `.env`. After logging in, credentials can be changed from the admin interface.

See `backend/.env.example` for the backend environment variables. To deploy `frontend/` and `backend/` separately, configure your hosting platform to proxy `/api/*` requests from the frontend to the backend; Vite's `/api` proxy is for local development only.
