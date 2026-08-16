# Frontend — InternX

Quick notes for frontend development and testing (frontend-only, mock backend available).

## Run (with mock backend)

Set the `VITE_USE_MOCK` env var to `true` to run the app without a real backend.

Windows (PowerShell):

```powershell
cd frontend
$env:VITE_USE_MOCK='true'
npm install
npm run dev
```

Unix/macOS:

```bash
cd frontend
VITE_USE_MOCK=true npm install
VITE_USE_MOCK=true npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173/`; if the port is taken Vite will pick another, e.g. `5174`).

## Demo accounts (mock)
- Student: `student@demo` / `demo`
- Industry: `industry@demo` / `demo`

## Environment
- Optional: `VITE_API_URL` — set to your backend API (default: `http://localhost:4000/api`)
- `VITE_USE_MOCK=true` runs the built-in frontend mock API located at `src/mocks/mockApi.js`.

## Useful pages / routes
- `/` — Login (when not authenticated)
- `#/register` — Register
- `#/profile` — Profile page
- `#/internships` — Internships list
- `#/internships/:id` — Internship detail and apply

## Notes for Frontend Developers
- The frontend attaches an in-memory `Authorization` header if the backend returns a token; prefer the backend to set HttpOnly cookies for production.
- Mock API supports basic auth, internships, profile, and applications; extend `src/mocks/mockApi.js` when you need more endpoints.

## Troubleshooting
- If API calls fail while using a real backend, ensure `VITE_API_URL` matches the backend and the backend is running on that host/port.

---
Happy hacking — open an issue or ping the backend teammate for auth details when moving off the mock.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
