## ⚡ QUICK START GUIDE

### Step 1: Get API Key (2 minutes)
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create Key" and copy it

### Step 2: Setup (3 minutes)
```bash
# In the D:\Nida Files\ directory:

# 1. Edit .env and paste your API key:
ANTHROPIC_API_KEY=sk-ant-your-key-here

# 2. Install dependencies:
npm install

# 3. Start the server:
npm start
```

### Step 3: Run App
- Open browser → http://localhost:3000
- Done! 🎉

### What You Just Set Up
✓ `server.js` - Backend that talks to Claude API
✓ `package.json` - Node.js dependencies  
✓ `.env` - Your API key (keep secret!)
✓ `index.html` - The web app (updated to use API)

### Troubleshooting

**"ERR: Cannot find module"**
→ Run `npm install` again

**"API Key Error"**  
→ Check `.env` file has correct key (no extra spaces)

**"Port 3000 already in use"**
→ Edit `.env` and change PORT to 3001 or any free port

**"CORS Error"**
→ Make sure you're using http://localhost:3000 (not 127.0.0.1)

### Files Created/Modified
- ✓ server.js (NEW)
- ✓ package.json (NEW)
- ✓ .env (NEW)
- ✓ .gitignore (NEW)
- ✓ README.md (NEW)
- ✓ index.html (UPDATED - uses API instead of window.claude)

### Next Steps
- Once running, try the app:
  1. Answer 7 style questions
  2. Enter lesson details
  3. Get complete lesson plan in 10 seconds
  4. Download/print the plan

---
Questions? Check README.md for full documentation
