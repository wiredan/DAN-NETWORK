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
# DAN-NETWORK Cloudflare Deployment

## 🧭 Steps to Deploy

1. Add all required GitHub Secrets:
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID
   - OPENAI_API_KEY
   - GEMINI_API_KEY
   - STRIPE_SECRET_KEY
   - DATABASE_URL
   - JWT_SECRET
   - R2_BUCKET_NAME

2. Delete any `.env` files from the repository (if committed before).
3. Push changes to `main`.
4. Check the **Actions** tab in GitHub — your app will build and deploy automatically.

## 🔧 Local Development

```bash
npm install
npm run dev