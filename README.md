### 🚀 Cloudflare Deployment Setup

#### Required Secrets (in GitHub → Settings → Secrets → Actions)

| Name | Description |
|------|--------------|
| CLOUDFLARE_API_TOKEN | Cloudflare API token with edit rights |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account ID |
| JWT_SECRET | JWT secret for auth |
| GEMINI_API_KEY | Gemini AI key |
| OPENAI_API_KEY | Optional |
| STRIPE_SECRET_KEY | Optional |
| D1_DATABASE_ID | D1 DB ID |
| D1_DATABASE_NAME | D1 DB name |
| KV_SESSIONS_ID | KV namespace ID |
| R2_BUCKET_NAME | R2 bucket name |
| R2_ACCESS_KEY_ID | R2 access key |
| R2_SECRET_ACCESS_KEY | R2 secret key |

#### Deployment
1. Add all the above secrets to GitHub.
2. Push changes to `main`.
3. GitHub Actions auto-deploys your Worker.
4. Cloudflare automatically connects your D1, KV, and R2 resources.
5. Frontend can deploy via Cloudflare Pages separately (output = `frontend/dist`).