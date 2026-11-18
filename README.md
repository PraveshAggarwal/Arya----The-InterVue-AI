# InterVue AI

InterVue AI is a resume-aware mock interview app. Candidates create an account, upload a PDF or DOCX resume, choose a job role and experience level, and practice a spoken interview with Arya. The app records a transcript and generates a performance report.

This repository contains three separately run applications:

| Part | Directory | Technology | Purpose |
| --- | --- | --- | --- |
| Web client | `frontend/` | React, Vite, Tailwind CSS | Setup, dashboard, interview room, and reports |
| Main API | `server/` | Node.js, Express, MongoDB/Mongoose | Authentication, resume records, interviews, and API proxy |
| AI service | `AiBackend/` | Python, FastAPI, Groq | Resume parsing, question generation, follow-ups, and assessment |

## Features

- Email and password registration and login, with hashed passwords and JWT authentication.
- PDF and DOCX resume upload, text extraction, resume management, and role-based interview setup.
- Generated interview plans based on the job role, job description, and resume.
- Browser-based camera, microphone, speech recognition, and speech synthesis for live practice. The selected synthetic voice depends on the voices installed in the user's browser and operating system.
- A 15-second no-speech pause before Arya repeats a question, followed by another 15-second chance to answer. When speech is detected, the app waits for an 8-second pause before submitting the answer.
- Conversational follow-ups for unclear or incomplete answers, including questions about resume projects, skills, and certifications.
- Transcript, interview history, completion remarks, scored question reviews, and a performance summary.
- Dashboard metrics and interview history.

## How it works

1. The React client calls the Express API at `VITE_API_BASE_URL`.
2. Express checks authentication, reads and writes application data through MongoDB, and sends AI requests to FastAPI.
3. FastAPI extracts uploaded resume text and calls Groq for structured interview questions, follow-ups, and reports.
4. The browser handles live speech recognition and speech playback. Camera and microphone permissions are required to enter the live interview.

The Node API and Python AI service both connect to MongoDB using the same `MONGO_URI`. The AI service saves generated question-plan sessions in the configured database.

## Requirements

- Node.js 20 or newer and npm.
- Python 3.10 or newer (Python 3.12 recommended).
- A MongoDB database. MongoDB Atlas is suitable for local development and small demos.
- A Groq API key and a model available to that key.
- A modern browser with camera/microphone access and Web Speech API support. Speech recognition support varies by browser; Chrome-based browsers generally provide the best compatibility.

## Local development

Run the Node API, Python AI service, and Vite client in three separate terminal windows. The commands below assume each terminal starts in the repository root.

### 1. Configure the main API

Create `server/.env`:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017
JWT_SECRET=replace-with-a-long-random-secret
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=
MAX_FILE_SIZE_MB=10
```

`AI_SERVICE_URL` is the AI service origin, with no trailing `/api`. The current AI service does not validate the forwarded `AI_SERVICE_SECRET` header; do not treat it as access control.

Install and start the API:

```powershell
cd server
npm ci
npm run dev
```

The API listens on port 5000 and exposes a health check at `http://localhost:5000/api/health`.

### 2. Configure and start the AI service

Create `AiBackend/.env`:

```dotenv
APP_NAME=InterVue AI
APP_ENV=development
DEBUG=false
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=aiinterviewer
MAX_RESUME_SIZE_MB=5
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

Install and start FastAPI from the `AiBackend` directory:

```powershell
cd AiBackend
py -m venv .venv
..venv\Scripts\Activate.ps1
py -m pip install -r requirements-production.txt
py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI health check: `http://localhost:8000/api/health`. Interactive API documentation: `http://localhost:8000/docs`.

### 3. Configure and start the web client

Create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Start Vite:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. You can also make a production client build with `npm run build`; Vite writes it to `frontend/dist`.

## Environment variables

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Frontend build | Yes | Express API base URL, including `/api` |
| `PORT` | Node API / hosting platform | No locally | HTTP listen port; hosting providers usually inject it |
| `CLIENT_URL` | Node API | Yes | Exact deployed frontend origin for CORS |
| `MONGO_URI` | Node and AI services | Yes | MongoDB connection URI |
| `JWT_SECRET` | Node API | Yes | Long, unique signing secret; keep it private |
| `AI_SERVICE_URL` | Node API | Yes | FastAPI origin, without `/api` |
| `AI_SERVICE_SECRET` | Node API | No | Forwarded request header, currently not verified by FastAPI |
| `MAX_FILE_SIZE_MB` | Node API | No | Uploaded resume limit; defaults to 10 MB |
| `GROQ_API_KEY` | AI service | Yes | Secret key used for model requests |
| `GROQ_MODEL` | AI service | No | Groq model identifier; defaults to `openai/gpt-oss-20b` |
| `MONGO_DB_NAME` | AI service | No | AI service database name; defaults to `aiinterviewer` |
| `MAX_RESUME_SIZE_MB` | AI service | No | Parsing request limit; defaults to 5 MB |
| `ALLOWED_ORIGINS` | AI service | No | Comma-separated CORS origins |
| `APP_ENV`, `APP_NAME`, `DEBUG` | AI service | No | FastAPI application settings |

Never commit `.env` files or put database, JWT, or AI provider secrets in a `VITE_*` variable. Frontend build variables are public in the built JavaScript.

## API overview

All Express API routes are under `/api`. Authenticated endpoints use a bearer token.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Main API health check |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET/PATCH | `/api/users/me` | Read/update current profile |
| GET, POST | `/api/resumes` | List resumes / upload a resume (upload uses multipart field `resume`) |
| GET, DELETE | `/api/resumes/:id` | Read or delete a resume |
| GET, POST | `/api/interviews` | List or create interviews |
| GET | `/api/interviews/:id` | Get an interview |
| POST | `/api/interviews/:id/next-question` | Continue the interview conversation |
| POST | `/api/interviews/:id/complete` | Save transcript and generate a report |
| GET, POST | `/api/questions/:id` | Read or generate an interview's planned questions |

FastAPI exposes `GET /api/health`, `POST /api/resume/parse`, `POST /api/questions/generate`, `POST /api/interview/next-question`, and `POST /api/interview/performance-report`. Express calls these service routes.

## Deploy a free demo

The following arrangement uses Vercel for the static client, Render for both APIs, and MongoDB Atlas for MongoDB. Free-plan policies and quotas can change; confirm them in the provider documentation: [Render free services](https://render.com/docs/free), [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), and [Atlas free cluster limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).

### 1. Create MongoDB Atlas database

1. Create an Atlas project and a free cluster.
2. Create a database user with a strong password.
3. Add the Render services' outbound IP access. Render free services do not provide a fixed outbound IP, so Atlas may require the broad `0.0.0.0/0` allow-list entry for this demo. Use a dedicated database user and strong password; this network rule is broader than ideal.
4. Copy the SRV connection string and replace its username/password placeholders. Use the same URI in both APIs. Free Atlas clusters have limited resources/storage and no default managed backups.

### 2. Deploy FastAPI on Render

1. Create a Render **Web Service** from the repository.
2. Set **Root Directory** to `AiBackend`.
3. Set **Build Command** to `pip install -r requirements-production.txt`.
4. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add `GROQ_API_KEY`, `GROQ_MODEL`, `MONGO_URI`, `MONGO_DB_NAME`, `MAX_RESUME_SIZE_MB`, `APP_ENV=production`, `DEBUG=false`, and `ALLOWED_ORIGINS` as environment variables. Set `ALLOWED_ORIGINS` to your Vercel site origin (and any other exact allowed origins).
6. Deploy and check `https://YOUR-AI-SERVICE.onrender.com/api/health`.

### 3. Deploy Express on Render

1. Create another Render **Web Service** from the same repository.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm ci` and **Start Command** to `npm start`.
4. Set `MONGO_URI` to the Atlas URI, `JWT_SECRET` to a different long random secret, `AI_SERVICE_URL` to the FastAPI service origin (for example, `https://YOUR-AI-SERVICE.onrender.com`), and `CLIENT_URL` to the Vercel site origin.
5. Add `MAX_FILE_SIZE_MB` if needed. The Node API's `PORT` is supplied by Render.
6. Deploy and check `https://YOUR-NODE-SERVICE.onrender.com/api/health`.

### 4. Deploy React on Vercel

1. Import the repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set the build command to `npm run build` and output directory to `dist` (Vercel detects Vite automatically).
4. Add `VITE_API_BASE_URL=https://YOUR-NODE-SERVICE.onrender.com/api` as a production environment variable, then deploy.
5. Copy the deployed Vercel origin into the Node API's `CLIENT_URL` and the AI service's `ALLOWED_ORIGINS`, then redeploy those services.

Vercel's rewrite configuration in `frontend/vercel.json` routes React Router page refreshes back to the single-page app.

## Free hosting limitations

- Render free web services sleep after 15 minutes without inbound traffic; waking a sleeping service can take around a minute. This can make the first login, resume upload, or interview request feel slow.
- Render free filesystems are ephemeral and may be cleared on restart, redeploy, or sleep. The app stores uploaded resume files on the Node service filesystem; the extracted resume text and metadata are stored in MongoDB. Do not rely on the hosted filesystem for permanent file retention.
- Render free web services share a monthly pool of 750 instance hours per workspace. Multiple services, usage, build minutes, or bandwidth can exhaust free allowances.
- Atlas free clusters are for small development/demo workloads and provide limited storage and features.
- Groq API use is subject to the provider's model availability and rate limits. Hosting may be free while AI requests are still subject to external provider quotas or pricing changes.
- Browser camera/microphone access requires HTTPS outside localhost. Vercel and Render provide HTTPS on their hosted domains.
- This arrangement is appropriate for a portfolio project or demo, not a reliability, privacy, backup, or uptime guarantee for a production business.

## Troubleshooting

- **Frontend reports a network/CORS error:** Verify `VITE_API_BASE_URL` ends in `/api`, and `CLIENT_URL` exactly matches the frontend origin, including scheme and hostname.
- **AI requests fail:** Check that Node's `AI_SERVICE_URL` is only the FastAPI origin and that `GROQ_API_KEY` and `GROQ_MODEL` are valid.
- **MongoDB connection fails in deployment:** Check the URI, database user credentials, encoded special characters in the password, and Atlas network access list.
- **Resume upload fails:** Verify the file is a readable PDF/DOCX and is below both the Node and Python file-size limits.
- **Camera or microphone is unavailable:** Grant browser permissions and use HTTPS (or localhost for local development).
- **Speech recognition is unavailable:** Try a supported Chromium browser and verify microphone permissions. Speech recognition and speech synthesis are browser-provided features, not server-side services.
- **First request takes a long time:** A free Render service may be waking from sleep; allow it to start and retry once.

## Repository notes

- `server/uploads/resumes` is created at runtime by the upload middleware.
- `AiBackend/requirements.txt` contains the broad development environment dependency list. `AiBackend/requirements-production.txt` is a smaller runtime-only list for deployment.
- Do not upload real candidate resumes to a public demo without considering consent, access controls, retention, and the privacy terms of the hosting and AI providers.
