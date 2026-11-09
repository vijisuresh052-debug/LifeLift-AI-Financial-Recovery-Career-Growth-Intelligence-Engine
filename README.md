# LifeLift AI Prototype

This is a local prototype website for *LifeLift AI - Financial Recovery & Career Growth Platform*.

## Files
- `index.html` - main app page
- `styles.css` - styling
- `app.js` - logic for scoring and simulation

## Run locally
### A) Plain prototype (UI-only)
1. Open `index.html` directly with your browser (double-click).

### B) React + Vite app
1. `cd "c:\Users\Suresh\Documents\lifelift ai\lifelift-react"`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

### C) Backend API
1. `cd "c:\Users\Suresh\Documents\lifelift ai\server"`
2. copy `.env.example` to `.env` and configure
3. `npm install`
4. `npm run dev` (needs Node installed)
5. API endpoints:
   - `POST /api/recommendations`
   - `POST /api/users`
   - `GET /api/users/:id`
   - `POST /api/plans`
   - `GET /api/plans/user/:userId`

### D) Full integrated dev
1. run API server on port 4000
2. run Vite app on 5173
3. open `http://localhost:5173` in Chrome
4. click "AI Advice" for OpenAI API results

## Usage
1. Fill `Name`, `Email`, `Role`, then `Login`.
2. Enter financial inputs and click `Analyze Finance`.
3. Enter career inputs and click `Analyze Career`.
4. Check results cards and simulation.

## Navigation
Use top nav: Home / Dashboard / Finance / Career / About.

## Next feature ideas
- Add multi-loan dynamic table
- Add charts (Recharts / Chart.js)
- Add backend (Node.js + MongoDB)
- Add AI API integration for intelligent recommendations
