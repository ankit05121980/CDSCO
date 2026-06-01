# Deploy DDRS (public URL)

## One-click (recommended — permanent URL)

1. Open **[Deploy to Render](https://render.com/deploy?repo=https://github.com/ankit05121980/CDSCO)** (free account).
2. Click **Deploy Blueprint** and wait ~10–15 minutes (Docker build + seed).
3. Your live URL will be shown on the Render dashboard, e.g. `https://ddrs-xxxx.onrender.com`.

Public pages work without login: `/`, `/verify`, `/registries`, `/grievance`, `/knowledge`, `/alerts`.

**Demo login:** `citizen@demo.in` / `Ddrs@2026` (see `docs/ROLES.md`).

## Docker (any host)

```bash
docker build -t ddrs .
docker run -p 10000:10000 -e NODE_ENV=production ddrs
```

Open http://localhost:10000
