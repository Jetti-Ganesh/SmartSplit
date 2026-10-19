# SmartSplit

## Vercel deployment

The root `vercel.json` deploys `Client` as the Vite frontend and `Server` as
the Express API. Requests to `/api/*` are routed to the server service; all other paths go to the client service. The client
service falls back to `index.html` for React Router deep links.
The browser uses same-origin `/api` requests, so these services do not need a
service binding.

Configure these server environment variables in Vercel before using the API:

- `MONGO_URI` — MongoDB connection string.
- `JWT_SECRET` — secret used to sign authentication tokens.
- `SESSION_SECRET` — optional; defaults to `JWT_SECRET` for session signing.

`VITE_API_URL` is optional. Leave it unset to use the same-origin `/api` route.
Only set it to an API origin if the API is intentionally hosted on a separate
domain. Email and SMS credentials are not needed to create or sign in to a
username/password account; features that send OTPs still require their
respective provider configuration.

For local development, run `node index.js` from `Server` on port `5000` and
`npm run dev` from `Client`. Vite proxies `/api` requests to the local server.
Run `vercel dev` from the repository root to exercise the services configuration
and routing together.
