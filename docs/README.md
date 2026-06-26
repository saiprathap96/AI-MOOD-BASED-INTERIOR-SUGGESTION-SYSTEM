# Sri Venkata Sai Furniture Works - AI Interior Mood Board Suggestion Tool

A production-ready web application enabling customers of Sri Venkata Sai Furniture Works to instantly curate complementary furniture sets matching their Room Type, Color Preference, and Budget (in ₹). It features an interactive mood board constructor, design history tracking, ratings feedback, and an analytical dashboard with rich charts.

---

## 📁 Repository Structure

```
/
├── backend/
│   ├── data/                 # Local JSON file database storage
│   ├── middleware/           # Rate-limiting middleware
│   ├── routes/               # Express endpoints routes definition
│   ├── controllers/          # Business logic handlers
│   ├── utils/                # Database & AI integration helpers
│   ├── index.js              # Server bootstrapper
│   └── package.json          # Node dependencies list
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Footer, StarRating, Charts, Skeletons, Toasts
│   │   ├── pages/            # Home, SuggestionTool, History, AdminDashboard
│   │   ├── hooks/            # useToast
│   │   ├── utils/            # api client
│   │   ├── App.jsx           # Main routing & state controller
│   │   ├── main.jsx          # React renderer
│   │   └── index.css         # Styling & print directives
│   ├── tailwind.config.js    # Tailwind colors & typography config
│   ├── vite.config.js        # Vite configs with backend proxy
│   ├── package.json          # Frontend packages list
│   └── index.html            # Core document
└── docs/
    └── README.md             # This guide
```

---

## 🛠️ Local Environment Setup

### Prerequisites
You need **Node.js (version 18 or above)** installed on your operating system.
- If Node.js is not installed, download the installer for your OS (Windows, macOS, or Linux) from [Node.js Official Website](https://nodejs.org/).
- Ensure the `node` and `npm` executables are in your system's environment variables (`PATH`).

---

### Step 1: Configure Backend Environment Variables
Create a file named `.env` in the `/backend` directory:
```bash
cd backend
copy .env.example .env
```
Open the `.env` file and input your credentials:
```env
PORT=5000
NODE_ENV=development

# AI API Key (Optionally provide one. If blank, app enters Mock Demo Mode)
GEMINI_API_KEY=your_gemini_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional Database credentials (If blank, local JSON database is used)
SUPABASE_URL=
SUPABASE_KEY=
```

---

### Step 2: Install Dependencies and Run Backend
Open a terminal in the `/backend` folder:
```bash
# Install packages
npm install

# Start Express server in development mode (auto-reloads on edits)
npm run dev
```
The server will start at: `http://localhost:5000`
You can verify it by checking the health status at: `http://localhost:5000/api/health`

---

### Step 3: Install Dependencies and Run Frontend
Open a new terminal window, navigate to the `/frontend` directory, and start Vite:
```bash
cd frontend

# Install packages
npm install

# Launch Vite development server
npm run dev
```
The client dashboard will load on: `http://localhost:3000`
Vite is pre-configured with a proxy target, automatically mapping all `/api/*` endpoints to your backend server running on port 5000.

---

## 🗄️ Supabase Schema Configuration (Optional)

By default, the backend operates on a local file-based database (`backend/data/suggestions.json`) and seeds 12 initial history entries. 

To transition to a live Postgres database in **Supabase**:
1. Create a free account at [Supabase](https://supabase.com/).
2. Create a new project.
3. Access the **SQL Editor** inside your Supabase dashboard.
4. Run the following raw SQL query to establish the `suggestions` table:

```sql
-- Create Suggestions Table
CREATE TABLE public.suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type VARCHAR(100) NOT NULL,
    colour_preference TEXT NOT NULL,
    budget NUMERIC NOT NULL,
    recommendation JSONB NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) and configure public access policy
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write for all users" ON public.suggestions
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

5. Copy your **Project URL** and **API Anon Key** from the Project Settings -> API page.
6. Paste them into the `SUPABASE_URL` and `SUPABASE_KEY` variables of your `/backend/.env` file.
7. Restart the backend server. The backend will automatically route queries and inserts to your Supabase tables.

---

## 🚀 Cloud Deployment Guide

### Backend: Host on Render
1. Register/Login to [Render](https://render.com/).
2. Select **New** -> **Web Service**.
3. Connect your GitHub repository containing the codebase.
4. Fill in these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. In the **Environment** tab, copy the variables from your local `.env` (API Keys, etc.).
6. Click **Deploy Web Service**. Render will output a live backend URL (e.g., `https://svs-backend.onrender.com`).

---

### Frontend: Host on Vercel
1. Login to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your repository.
3. In the project setup panel:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click deploy. Vercel will host your static React application.

**Connecting Frontend & Backend in Production**:
To point the static Vite build directly to your remote Render server instead of localhost in production, create a file named `vercel.json` in the `/frontend` root with rewrite rules, or simply update `frontend/src/utils/api.js` to point `API_BASE` directly to your deployed Render URL:
```javascript
// frontend/src/utils/api.js
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com/api' 
  : '/api';
```
 Vercel routing rules or absolute API paths are ideal for final distribution.
