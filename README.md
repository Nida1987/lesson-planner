# حضّرلي - Haddirli (Lesson Planning Tool)

A powerful AI-powered lesson planning tool that generates complete lesson plans and educational infographics in seconds.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Claude API key from Anthropic

### Installation

1. **Get your Claude API Key**
   - Go to https://console.anthropic.com
   - Create an account or sign in
   - Navigate to API keys section
   - Create a new API key and copy it

2. **Configure Environment**
   - Open `.env` file in the project directory
   - Replace `your-api-key-here` with your actual Claude API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
   PORT=3000
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development (with auto-reload):
   ```bash
   npm run dev
   ```

5. **Open the Application**
   - Open your browser and go to: `http://localhost:3000`
   - The index.html will load automatically

### How It Works

1. **Welcome Screen** - Learn about the tool
2. **Style Quiz** - Answer 7 questions about your teaching style (5-7 minutes)
3. **Lesson Details** - Enter lesson information (subject, grade, topic, etc.)
4. **Lesson Plan Generated** - AI creates a complete lesson plan with:
   - Learning objectives
   - Key concepts
   - Detailed activities with timing
   - Assessment tools
   - Homework suggestions
   - Teacher notes
5. **Educational Infographic** - Visual summary of the lesson

### Supported Languages
- العربية (Arabic)
- English
- עברית (Hebrew)

### Features
- ✓ Complete lesson plans tailored to teaching style
- ✓ Adaptive timing based on lesson type
- ✓ Differentiation strategies for advanced & struggling students
- ✓ Educational infographics generation
- ✓ Export/Print functionality
- ✓ Multi-language support
- ✓ No data storage (privacy-focused)

### API Endpoints

- `POST /api/generate-plan` - Generate a lesson plan
  - Body: `{ lesson, style, totalMin, t0, t1, t2 }`
  
- `POST /api/generate-infographic` - Generate educational infographic
  - Body: `{ lesson }`

### Troubleshooting

**"Cannot connect to server"**
- Make sure the server is running with `npm start`
- Check if port 3000 is available or change PORT in .env

**"API Error - Invalid API Key"**
- Verify your ANTHROPIC_API_KEY in .env is correct
- Check that there are no extra spaces or quotes

**"CORS Error"**
- Make sure the server is running locally
- The app should work on `http://localhost:3000`

### Technology Stack
- Frontend: React 18 (React CDN)
- Backend: Node.js + Express
- AI: Claude API (Anthropic)
- Styling: CSS (custom design system)
- Language: Vanilla JavaScript + Babel

### Project Structure
```
D:\Nida Files\
├── index.html          # Main application
├── server.js           # Backend server
├── package.json        # Dependencies
├── .env                # Environment variables (API key)
└── README.md           # This file
```

### Notes
- The app uses React from CDN for easy deployment
- All styling is inline to keep it as a single HTML file
- Supports RTL languages (Arabic, Hebrew)
- Plans are tailored based on lesson type, difficulty, and teaching style
- Generated content is 100% unique and context-specific

---

Created with ❤️ for teachers | Powered by Claude AI
