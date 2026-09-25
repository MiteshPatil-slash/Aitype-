# TypeAI — AI-Powered Interactive Typing Speed Tester

TypeAI is a full-featured, AI-powered typing speed tester engineered with a human-designed SaaS aesthetic. It captures keypress cadences, analyzes user typing errors, communicates with Google Gemini AI through a secure backend, and dynamically generates personalized follow-up paragraphs targeting specific typing weaknesses.

---

## ✨ Features

- **Full SaaS Experience**: Edge-to-edge layout, warm cream surfaces, dark charcoal typography, and muted forest green accents.
- **Dynamic Typing Engine**: Real-time keystroke tracking with green (correct) and red (incorrect) feedback, live blinking cursor, live WPM, accuracy, and error counting.
- **Requirements & Start Flow**: Select Difficulty (`Easy`, `Medium`, `Hard`) and Duration (`30s`, `60s`, `120s`), then start the test.
- **Results Dashboard**: Confetti celebration, performance metric cards, SVG Donut chart, and character breakdown.
- **Gemini AI Integration**: Sends actual user session data (mistyped keys, accuracy, speed, elapsed time) to Google Gemini via the official `@google/genai` SDK.
- **Personalized AI Drill Generator**: Gemini generates a custom 70–120 word typing paragraph tailored specifically to the user's weak keys.
- **One-Click Retesting**: Click "Start Next Test" to instantly load the AI-generated paragraph into the typing test.
- **Persistent History**: Stores past sessions in `localStorage` with stats summary (Best WPM, Average WPM, Average Accuracy, Total Tests) and clear option.
- **Theme Switcher**: Working light/dark mode with localStorage persistence.
- **100% Secure**: Server-side API key handling; the Gemini secret key is never exposed to the frontend.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Plus Jakarta Sans & Fira Code typography
- **Backend / Serverless**: Node.js, Vercel Serverless Function (`/api/analyze.js`), Vite dev middleware
- **AI SDK**: Official `@google/genai`
- **Model**: `gemini-2.5-flash` (with automated fallback to `gemini-2.0-flash` / `gemini-1.5-flash`)
- **Storage**: Browser `localStorage` for history and theme preferences

---

## 📁 Project Structure

```
D:\type test\
├── api/
│   └── analyze.js           # Serverless API endpoint for Gemini analysis
├── public/
│   └── image/
│       └── lapptop.png      # Workspace photography asset
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Unified navbar (Home, Test, History, About, Theme)
│   │   ├── HomeScreen.jsx       # Landing page with hero & benefit cards
│   │   ├── TypingTestScreen.jsx # Dynamic typing engine & live metrics
│   │   ├── ResultsScreen.jsx    # Celebration, breakdown donut, & AI trigger
│   │   ├── AiAnalysisScreen.jsx # Gemini feedback & AI-generated practice drill
│   │   ├── HistoryModal.jsx     # LocalStorage session history & metrics
│   │   ├── AboutModal.jsx       # About dialog
│   │   └── DemoModal.jsx        # Walkthrough demo dialog
│   ├── App.jsx              # Main application coordinator & state manager
│   ├── main.jsx             # React DOM entry point
│   └── index.css            # Full-viewport SaaS styling & theme variables
├── .env                     # Server environment variables (git-ignored)
├── .env.example             # Template for environment variables
├── .gitignore               # Ignores .env and node_modules
├── package.json             # Dependencies and build scripts
└── vite.config.js           # Vite dev server with integrated /api/analyze routing
```

---

## 🔑 Gemini API Setup

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Open the `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. Save the file. The Vite dev server will automatically reload with the new key.

---

## 💻 Local Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Make sure `.env` contains your key:
```bash
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. Both the React frontend and `/api/analyze` backend endpoint run concurrently on this port.

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

1. Push your project to a GitHub / GitLab / Bitbucket repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. In the **Environment Variables** section, add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `your_actual_gemini_api_key_here`
   - **Environment**: Select `Production`, `Preview`, and `Development`.
5. Click **Deploy**. Vercel will automatically configure `/api/analyze.js` as a serverless function and host the static Vite assets.

---

## 🧠 How the AI Analysis Works

1. **Keystroke Tracking**: The typing engine monitors character mismatches in real time, calculating error frequencies for each letter.
2. **Pre-Analysis**: The backend categorizes which keys the user struggled with most (e.g., `t`, `r`, `e`).
3. **Structured Prompting**: A system instruction instructs Gemini to act as an expert typing coach and generate a JSON payload with:
   - Overall Performance evaluation
   - Summary of rhythm and speed
   - List of mistyped keys with error counts
   - Common error pattern diagnostics
   - Actionable improvement suggestions
   - A natural 70–120 word practice paragraph incorporating the user's weak keys
   - Explanation of why the paragraph was generated
4. **Adaptive Retesting**: Clicking **Start Next Test** loads this AI-generated drill directly into the typing area for immediate practice.

---

## 🔒 Security Notes

- The `GEMINI_API_KEY` is strictly accessed on the server side (`process.env.GEMINI_API_KEY` in `api/analyze.js`).
- It is never exposed in frontend code, client bundles, or network payloads.
- `.env` is listed in `.gitignore` to prevent secret leakage in version control.
