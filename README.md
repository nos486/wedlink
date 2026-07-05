# 💍 WedLink

> A beautiful wedding invitation link generator — deployed on Cloudflare Workers + Pages with a D1 database.

---

## Project Structure

```
wedlink/
├── worker/          # Cloudflare Worker — Hono REST API
│   ├── src/
│   │   ├── index.ts              # App entry point
│   │   ├── types.ts              # Shared types
│   │   └── routes/
│   │       ├── invitations.ts    # CRUD routes
│   │       └── rsvp.ts           # RSVP submission
│   ├── schema.sql                # D1 schema
│   └── wrangler.toml             # Worker config
│
└── frontend/        # Cloudflare Pages — Vanilla HTML/CSS/JS
    └── public/
        ├── index.html            # Admin dashboard
        ├── invite.html           # Public invitation view + RSVP
        └── assets/
            ├── css/
            │   ├── style.css     # Global design system
            │   ├── admin.css     # Dashboard styles
            │   └── invite.css    # Invitation page styles
            └── js/
                ├── admin.js      # Dashboard logic
                └── invite.js     # Invitation + RSVP logic
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/invitations` | List all invitations |
| `POST` | `/api/invitations` | Create invitation |
| `GET` | `/api/invitations/:slug` | Get invitation by slug |
| `GET` | `/api/invitations/:slug/rsvps` | List RSVPs |
| `POST` | `/api/invitations/:slug/rsvp` | Submit RSVP |
| `DELETE` | `/api/invitations/:slug` | Delete invitation |

---

## Cloudflare Setup (Manual Steps)

### 1. Create D1 Database
1. Go to [Cloudflare Dashboard → Workers & Pages → D1](https://dash.cloudflare.com/?to=/:account/d1)
2. Create a database named `wedlink-db`
3. Copy the **Database ID**
4. Update `worker/wrangler.toml` → replace `YOUR_D1_DATABASE_ID` with the real ID

### 2. Deploy the Worker
1. Go to **Workers & Pages → Create Application → Worker**
2. Connect it to your GitHub repo (`nos486/wedlink`)
3. Set **root directory** to `worker/`
4. Set **build command** to `npm install`
5. Set **deploy command** to `npm run deploy`
6. Bind the D1 database: in Worker settings → Variables → D1 Database Bindings → `DB = wedlink-db`

### 3. Initialize the D1 Schema
After the Worker is deployed and D1 is bound, run:
```bash
cd worker
npm install
wrangler d1 execute wedlink-db --remote --file=schema.sql
```

### 4. Deploy the Frontend (Pages)
1. Go to **Workers & Pages → Create Application → Pages**
2. Connect to GitHub repo (`nos486/wedlink`)
3. Set **root directory** to `frontend/`
4. Set **build output directory** to `public`
5. Leave build command empty (static files, no build step)

### 5. Update API URL in Frontend
After deploying the Worker, get its URL (e.g. `https://wedlink-api.yourname.workers.dev`) and update:
- `frontend/public/assets/js/admin.js` → line 5: `const API_BASE_URL = '...'`
- `frontend/public/assets/js/invite.js` → line 5: `const API_BASE_URL = '...'`

Then commit and push — Cloudflare Pages will auto-redeploy.

---

## Local Development

### Worker (API)
```bash
cd worker
npm install
# Start local dev server with local D1
wrangler dev
# Init local D1 schema
npm run db:init
```

### Frontend (Static)
```bash
cd frontend
npx serve public -p 3000
```

Then open `http://localhost:3000` — update `API_BASE_URL` in the JS to `http://localhost:8787`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Cloudflare Workers + Hono v4 |
| Database | Cloudflare D1 (SQLite) |
| Frontend | Vanilla HTML + CSS + JavaScript |
| Fonts | Google Fonts (Playfair Display, Inter, Great Vibes) |
| Hosting | Cloudflare Workers + Pages |
| CI/CD | GitHub → Cloudflare Pages (auto-deploy) |

---

## License

MIT — see [LICENSE](LICENSE)

Made with 💍 by [WedLink](https://github.com/nos486/wedlink)
