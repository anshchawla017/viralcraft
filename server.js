// Local development entry point: `node server.js`
// (On Vercel, api/index.js is used instead — see that file.)
const app = require('./server/app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ ViralCraft running at http://localhost:${PORT}`);
  console.log(`   Powered by Groq (free tier)\n`);
});
