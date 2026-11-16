# Deployment setup

Deploy this folder as its own Vercel project with this folder as the project root. Vercel serves the Express API from `api/[...path].js`; the `/api/*` endpoint paths stay unchanged.

Set these Environment Variables in the Vercel project (Production and Preview as needed):

- `MONGO_URI`
- `JWT_SECRET`, `SECURE_KEY`
- `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- `STRIPE_SECRET_KEY`
- `EMAIL_USER`, `EMAIL_PASS`
- `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (the complete service-account JSON on one line)
- `CRON_SECRET` (a long random value; Vercel uses it to authorize the scheduled offer job)
- `CORS_ORIGINS` (comma-separated exact deployed frontend origins, including `https://e-commerce-react-js-web.netlify.app` and the dashboard's Vercel URL)

The dashboard build must receive `REACT_APP_API_URL=https://<backend-project>.vercel.app/api` in its Vercel project settings. The existing Netlify storefront must receive the same variable in its site build environment, then be redeployed. React environment variables are embedded at build time.

Keep the backend project's Vercel Cron enabled for `/api/cron`. On the Hobby plan it runs once daily at midnight UTC (`0 0 * * *`), so offer processing is only refreshed daily. The backend also attaches Socket.IO to its local HTTP server, but Vercel Functions do not provide persistent Socket.IO connections; the dashboard's live order and notification events therefore need a separate persistent realtime host or a polling implementation.

The dashboard and storefront are separate frontend builds. Do not add the backend's private credentials to either frontend project. `FIREBASE_SERVICE_ACCOUNT_JSON` replaces the ignored local `firebase-service-account.json` file for hosted deployments.
