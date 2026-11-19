# InterVue AI

InterVue AI is an intelligent, conversational mock interview platform engineered by [Pravesh Aggarwal](https://github.com/PraveshAggarwal). Candidates upload their PDF or DOCX resume, choose their target job role and experience level, and practice an interactive voice interview with **Arya**, an AI technical interviewer who listens, asks contextual follow-ups, and scores candidate performance.

---

## 👨‍💻 Developer & Links

- **Sole Architect & Developer**: [Pravesh Aggarwal](https://github.com/PraveshAggarwal)
- **GitHub**: [https://github.com/PraveshAggarwal](https://github.com/PraveshAggarwal)
- **LinkedIn**: [https://www.linkedin.com/in/praveshaggarwal10/](https://www.linkedin.com/in/praveshaggarwal10/)
- **X (Twitter)**: [https://x.com/ImPraveshAgg](https://x.com/ImPraveshAgg)

---

## Architecture Overview

This monorepo consists of three decoupled components:

| Component | Directory | Tech Stack | Role |
| --- | --- | --- | --- |
| **Client** | `frontend/` | React 19, Vite, Tailwind CSS v4, Lucide Icons | Responsive UI, live studio, voice interaction, candidate dashboard |
| **API Gateway** | `server/` | Node.js, Express, MongoDB, Mongoose, JWT | Authentication, resume storage, interview coordination, proxy |
| **AI Intelligence Service** | `AiBackend/` | Python 3.12, FastAPI, Groq LLM | Resume parsing, tailored question synthesis, adaptive follow-ups |

---

## Core Features

- **Resume-Grounded Questions**: Extracts text from PDF and DOCX files, mapping previous experience, technologies, and projects directly to the job role.
- **Hands-Free Conversational Voice Interview**: Live Web Speech API speech-to-text and native speech synthesis. Candidates speak naturally into their microphone while Arya listens, without requiring manual button clicks.
- **Adaptive Multi-Turn Follow-Ups**: Evaluates response depth after each turn and formulates dynamic follow-ups probing trade-offs and architectural decisions.
- **1-Click Recommended Session Auto-Fill**: Click any recommended session (e.g. *System Design*, *Behavioral Leadership*, *React Performance*) to automatically populate the setup form.
- **Executive Performance Debrief**: In-depth scorecard across Communication, Technical Depth, Problem Solving, and Executive Presence, plus question-by-question response logs and constructive remarks.
- **Candidate Dashboard**: Track completed sessions, review past transcripts, and manage uploaded resumes.

---

## System Requirements

- **Node.js**: v20 or newer with `npm`.
- **Python**: 3.10+ (Python 3.12 recommended).
- **Database**: MongoDB (Local MongoDB community server or MongoDB Atlas).
- **LLM Provider**: A [Groq](https://groq.com/) API Key for high-speed model inference.
- **Browser**: Modern Chromium-based browser (Chrome, Edge, Brave) with microphone and camera access.

---

## Local Development Setup

Run the Node API, Python AI Service, and Vite client in separate terminal windows from the repository root.

### 1. Main API Service (`server/`)

Create `server/.env`:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/aiinterviewer
JWT_SECRET=your_super_secret_jwt_key_here
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=
MAX_FILE_SIZE_MB=10
```

Install dependencies and start the development server:

```bash
cd server
npm install
npm run dev
```

Health check: `http://localhost:5000/api/health`

---

### 2. Python AI Service (`AiBackend/`)

Create `AiBackend/.env`:

```dotenv
APP_NAME=InterVue AI
APP_ENV=development
DEBUG=false
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=aiinterviewer
MAX_RESUME_SIZE_MB=5
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

Set up virtual environment and run FastAPI:

```bash
cd AiBackend
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements-production.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `http://localhost:8000/api/health`  
Interactive Swagger docs: `http://localhost:8000/docs`

---

### 3. Frontend Web Client (`frontend/`)

Create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Install dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deployment Guide (Render & Vercel)

Deploy the backend services on **Render** and the frontend client on **Vercel**, connecting both to a free **MongoDB Atlas** cluster.

### 1. Configure MongoDB Atlas

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and record the username and password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render instances can connect.
4. Copy your cluster's connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/aiinterviewer?retryWrites=true&w=majority
   ```

---

### 2. Deploy Python AI Service on Render

1. Log in to [Render](https://render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your repository.
3. Configure the service:
   - **Name**: `intervue-ai-backend`
   - **Root Directory**: `AiBackend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements-production.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the following **Environment Variables**:
   - `GROQ_API_KEY`: *(Your Groq API key)*
   - `GROQ_MODEL`: `openai/gpt-oss-20b` (or your chosen Groq model)
   - `MONGO_URI`: *(Your MongoDB Atlas connection URI)*
   - `MONGO_DB_NAME`: `aiinterviewer`
   - `MAX_RESUME_SIZE_MB`: `5`
   - `APP_ENV`: `production`
   - `DEBUG`: `false`
   - `ALLOWED_ORIGINS`: `https://YOUR-APP.vercel.app,https://YOUR-NODE-SERVICE.onrender.com`
5. Click **Create Web Service**. Note your service URL (e.g., `https://intervue-ai-backend.onrender.com`).

---

### 3. Deploy Express API on Render

1. Click **New +** $\rightarrow$ **Web Service** on Render.
2. Connect the same repository.
3. Configure the service:
   - **Name**: `intervue-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *(Your MongoDB Atlas connection URI)*
   - `JWT_SECRET`: *(A secure 64-character random string)*
   - `AI_SERVICE_URL`: `https://intervue-ai-backend.onrender.com` *(FastAPI service URL from Step 2, no trailing slash)*
   - `CLIENT_URL`: `https://YOUR-APP.vercel.app` *(Your Vercel frontend URL)*
   - `MAX_FILE_SIZE_MB`: `10`
5. Click **Create Web Service**. Note your API URL (e.g., `https://intervue-api.onrender.com`).

---

### 4. Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New** $\rightarrow$ **Project**.
2. Import your GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://intervue-api.onrender.com/api` *(Your Render Node API URL + `/api`)*
5. Click **Deploy**.
6. Once deployed, update `CLIENT_URL` on your Render Node service and `ALLOWED_ORIGINS` on your Render AI service to match your live Vercel domain (e.g. `https://your-project.vercel.app`).

---

## Environment Variables Reference

| Variable | Used By | Required | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Frontend | Yes | Base URL for Node.js API endpoint (includes `/api`) |
| `PORT` | Node / Python | Auto | Port injected by Render; defaults locally |
| `CLIENT_URL` | Node API | Yes | Exact deployed origin of Vercel frontend for CORS |
| `MONGO_URI` | Node & Python | Yes | MongoDB Atlas or local connection string |
| `JWT_SECRET` | Node API | Yes | Cryptographic secret for signing candidate auth tokens |
| `AI_SERVICE_URL` | Node API | Yes | Origin of FastAPI Python AI service without trailing slash |
| `GROQ_API_KEY` | Python AI | Yes | Secret API key for Groq LLM inference |
| `GROQ_MODEL` | Python AI | No | Model identifier (defaults to `openai/gpt-oss-20b`) |
| `ALLOWED_ORIGINS` | Python AI | Yes | Comma-separated list of permitted CORS origins |

---

## Troubleshooting

- **CORS or Network Error on Requests**: Ensure `VITE_API_BASE_URL` ends with `/api` and `CLIENT_URL` on Render matches your exact Vercel URL (including `https://` without trailing slash).
- **Microphone or Camera Permission Blocked**: The Web Speech API and WebRTC camera stream require an HTTPS connection in deployed environments or `localhost` during local development.
- **Render Free Tier Spin-up**: Render free web services spin down after 15 minutes of inactivity. The first request after sleep may take ~45 seconds to warm up.

---

## License

This project is licensed under the MIT License. Built with ❤️ by [Pravesh Aggarwal](https://github.com/PraveshAggarwal).
