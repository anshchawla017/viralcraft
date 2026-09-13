require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, style.css, app.js) from /public.
// (Only matters for local `node server.js` — on Vercel these are served
// directly by the platform; this function only ever handles /api/* traffic.)
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

const GROQ_KEY = process.env.GROQ_API_KEY;
const KEY_MISSING = !GROQ_KEY || GROQ_KEY === 'your_groq_api_key_here';

if (KEY_MISSING) {
  console.error('\n❌ WARNING: GROQ_API_KEY not set!');
  console.error('   Local: add it to your .env file.');
  console.error('   Vercel: Project Settings → Environment Variables, then redeploy.\n');
} else {
  console.log('✅ Groq API key found:', GROQ_KEY.substring(0, 8) + '...');
}

app.get('/api/test', (req, res) => {
  res.json({ status: 'Server is working!', keyLoaded: !KEY_MISSING });
});

app.post('/api/generate', async (req, res) => {
  if (KEY_MISSING) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured on the server. Add it in your .env (local) or Vercel project → Settings → Environment Variables, then redeploy.'
    });
  }

  const { topic, niche, tone, platform, audience } = req.body || {};

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const prompt = `You are an elite viral content strategist with deep expertise in ${platform} algorithm and viral psychology.

Platform: ${platform}
Topic: ${topic}
Niche: ${niche || 'general'}
Tone: ${tone}
Target audience: ${audience || 'general audience'}

Generate a complete viral content strategy. Respond ONLY with valid JSON, no markdown, no extra text:
{
  "viral_score": <integer 1-100>,
  "best_time": "<e.g. 7-9 PM IST>",
  "estimated_reach": "<e.g. 10K-80K>",
  "hooks": [
    {"hook": "<compelling opening line that stops scrolling>", "why": "<one concise sentence explaining the psychological trigger>"},
    {"hook": "<different angle — curiosity gap, controversy, or shock>", "why": "<why this works>"},
    {"hook": "<third hook — storytelling or relatable pain point>", "why": "<why this works>"}
  ],
  "caption": "<full optimized caption with emojis if appropriate, natural line breaks, and a strong CTA — write it ready to paste>",
  "hashtags": {
    "high_volume": ["tag1","tag2","tag3","tag4","tag5"],
    "mid_volume": ["tag1","tag2","tag3","tag4","tag5"],
    "niche": ["tag1","tag2","tag3","tag4","tag5"]
  },
  "script_outline": "<Detailed content outline with timestamps or clear sections. What to say/show at each moment to maximize watch time and retention. Make it actionable and specific.>"
}`;

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    });
  } catch (networkErr) {
    console.error('❌ Could not reach Groq:', networkErr.message);
    return res.status(502).json({ error: 'Could not reach the AI service. Please try again in a moment.' });
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    console.error('❌ Groq returned a non-JSON response, status:', response.status);
    return res.status(502).json({ error: 'The AI service returned an unexpected response. Please try again.' });
  }

  if (!response.ok || data.error) {
    console.error('❌ Groq error:', data.error || data);
    return res.status(400).json({ error: 'AI error: ' + (data.error?.message || 'request failed') });
  }

  try {
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error('❌ Could not parse AI response as JSON:', err.message);
    res.status(502).json({ error: 'The AI response was malformed. Please try again.' });
  }
});

// Homepage fallback (client-side routing safety net)
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Catch-all error handler — guarantees JSON is always returned, never an HTML
// error page, even if something above throws unexpectedly.
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Unexpected server error. Please try again.' });
});

module.exports = app;
