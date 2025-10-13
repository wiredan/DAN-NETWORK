### 🌐 Frontend Deployment (Cloudflare Pages)

The `frontend/` folder (React + Vite) deploys automatically via GitHub Actions.

**Workflow:** `.github/workflows/pages.yml`

#### Build & Deploy Settings
| Setting | Value |
|----------|--------|
| Build command | `cd frontend && npm ci && npm run build` |
| Output directory | `frontend/dist` |
| Environment variables | Same as Worker (`JWT_SECRET`, `GEMINI_API_KEY`, etc.) if needed |

#### To enable:
1. Ensure the same secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) exist in GitHub.
2. The first push will create a new Pages project named `dan-network-frontend` in Cloudflare automatically.
3. After deployment, you’ll get your site URL (e.g. `dan-network-frontend.pages.dev`).

---

You can link this Pages frontend with your Worker backend under **Cloudflare → Pages → Settings → Functions / Worker Bindings**.