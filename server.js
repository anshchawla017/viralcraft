const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTE ──
app.post('/api/generate', async (req, res) => {
  const { topic, niche, tone, platform, audience } = req.body;

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

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Groq error:', data.error);
      return res.status(500).json({ error: 'AI error: ' + data.error.message });
    }

    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ ViralCraft running at http://localhost:${PORT}`);
  console.log(`   Powered by Groq + Llama 3.3 70B (free tier)\n`);
});
