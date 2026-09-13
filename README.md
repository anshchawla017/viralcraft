# ViralCraft — AI Content Generator

Generates viral hooks, captions, hashtags, and script outlines for Instagram/YouTube/Twitter, powered by a free Groq API key.

## Files

| File                | Purpose                                            |
|---------------------|-----------------------------------------------------|
| `server/app.js`     | The actual Express app + AI route                  |
| `server.js`         | Local dev entry point — run `node server.js`       |
| `api/index.js`      | Vercel serverless entry point (don't run directly) |
| `public/index.html` | Main webpage                                        |
| `public/style.css`  | Styles                                              |
| `public/app.js`     | Frontend logic                                      |
| `.env.example`      | Template for your API key (copy to `.env`)         |
| `vercel.json`       | Serves `public/` as the site, routes `/api/*` to the function |

## Run it locally

1. Install [Node.js](https://nodejs.org) (LTS version)
2. Open a terminal in this folder
3. Copy `.env.example` to `.env` and paste in your own Groq API key:
   ```
   GROQ_API_KEY=your_key_here
   ```
   Get a free key at https://console.groq.com → API Keys → Create Key
4. Install dependencies:
   ```
   npm install
   ```
5. Start the server:
   ```
   node server.js
   ```
6. Open http://localhost:3000

## Deploy on Vercel

1. Push this repo to GitHub
2. Go to https://vercel.com → **Add New Project** → import your GitHub repo
3. In the project's **Settings → Environment Variables**, add:
   - `GROQ_API_KEY` = your Groq key
4. Deploy

**Never commit your real `.env` file.** It's already excluded via `.gitignore`.

## Troubleshooting

- `keyLoaded: false` at `/api/test` → your `GROQ_API_KEY` isn't set in Vercel's Environment Variables, or you haven't redeployed since adding it
- `"model does not exist"` error → Groq occasionally retires free-tier models; check https://console.groq.com/docs/models for a current model ID and update it in `server/app.js`
- Blank/broken page on Vercel → make sure `vercel.json`'s `outputDirectory` is set to `public`
