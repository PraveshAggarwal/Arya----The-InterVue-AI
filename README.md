# InterVue AI — Conversational Mock Interview & ATS Readiness Platform

**InterVue AI** is a full-stack, production-ready AI interview and resume intelligence platform architected and developed by **[Pravesh Aggarwal](https://github.com/PraveshAggarwal)**. The application pairs candidates' resumes with specific job roles and job descriptions to conduct realistic, two-way spoken mock interviews with **Arya**, a senior AI technical interviewer who listens, asks contextual follow-ups, and produces granular performance evaluations.

The platform also features a comprehensive **ATS Resume Analyzer** that evaluates resume formatting, keyword coverage, role fit, and quantified impact against real employer job specifications.

---

## 👨‍💻 Developer & Attribution

- **Sole Architect & Developer**: [Pravesh Aggarwal](https://github.com/PraveshAggarwal)
- **GitHub**: [https://github.com/PraveshAggarwal](https://github.com/PraveshAggarwal)
- **LinkedIn**: [https://www.linkedin.com/in/praveshaggarwal10/](https://www.linkedin.com/in/praveshaggarwal10/)
- **X (Twitter)**: [https://x.com/ImPraveshAgg](https://x.com/ImPraveshAgg)

---

## 🏗️ System Architecture

InterVue AI is structured as a decoupled monorepo composed of three dedicated applications:

```
                          ┌─────────────────────────────────────┐
                          │         React 19 Client             │
                          │   (Vite, Tailwind v4, Web Speech)   │
                          └──────────────────┬──────────────────┘
                                             │ HTTP / Bearer JWT
                                             ▼
                          ┌─────────────────────────────────────┐
                          │       Node.js Express Gateway       │
                          │   (Auth, Resumes, Interview State)  │
                          └──────┬────────────────────────┬─────┘
                                 │                        │
               MongoDB Read/Write│                        │ Internal HTTP
                                 ▼                        ▼
                ┌────────────────────────┐      ┌─────────────────────────┐
                │   MongoDB Database     │      │   FastAPI AI Service    │
                │ (Users, Resumes, Data) │      │ (Groq LLM, PyPDF, Pars) │
                └────────────────────────┘      └─────────────────────────┘
```

| Component | Directory | Technology Stack | Core Responsibilities |
| --- | --- | --- | --- |
| **Web Client** | `frontend/` | React 19, Vite, Tailwind CSS v4, Lucide Icons | Responsive studio UI, browser Web Speech recognition & synthesis, camera preview, candidate dashboards, reports |
| **API Gateway** | `server/` | Node.js, Express 5, MongoDB, Mongoose, JWT, Multer | Candidate authentication, resume file storage, interview state machine, API rate limiting, AI service proxy |
| **AI Intelligence Service** | `AiBackend/` | Python 3.12, FastAPI, Groq LLM (Llama 3 / Mixtral), PyPDF, Python-docx | Resume text extraction, ATS rubric analysis, progressive 15-question plan synthesis, multi-turn adaptive follow-ups |

---

## 🚀 Key Features

### 1. Conversational Voice Interview with Arya
- **Hands-Free Speech Recognition**: Live speech-to-text powered by the native browser Web Speech API. Candidates speak naturally into their microphone without holding down buttons.
- **Natural Speech Synthesis**: Arya speaks questions aloud with lifelike cadence and responsive audio waveform animations.
- **Intelligent Silence & Turn Detection**:
  - **15-second silence prompt**: If a candidate pauses for 15 seconds, Arya gently repeats the question or provides a supportive hint.
  - **8-second pause submission**: When the candidate finishes speaking, an 8-second conversational pause automatically submits their answer.
  - **Manual override**: A "Done Speaking" button is available for immediate submission.
- **Adaptive Multi-Turn Follow-Ups**: Arya evaluates the technical depth of each response. If an answer is vague or misses critical architectural considerations, she asks targeted follow-ups based directly on the candidate's declared projects and skills (up to 2 follow-ups per topic).
- **Anti-Repetition Guarantee**: The engine tracks all previous conversation turns and prevents repeating or paraphrasing questions already asked.
- **Supportive Hints for Stalled Candidates**: For blank or "I don't know" answers, Arya provides non-judgmental guidance and a focused probe rather than abruptly changing topics.

### 2. ATS Resume Readiness & Keyword Gap Audit
- **Instant ATS Scoring (0–100)**: Upload any PDF or DOCX resume to extract text and compute an ATS readiness benchmark based on modern parsing standards.
- **5-Metric Section Rubric**:
  - **Role Alignment**: Match between resume trajectory and target title.
  - **Skills Coverage**: Presence of core and secondary technical competencies.
  - **Experience Detail**: Granularity and depth of previous responsibilities.
  - **Measurable Impact**: Presence of quantified metrics (%, $, latency, throughput).
  - **Structure & Readability**: Clean formatting, section hierarchy, and contact info.
- **Matched vs. Missing Keyword Clouds**: Cross-references resume text against the target job description to highlight keywords already matched and high-value terms to consider adding.
- **Priority Improvement Steps**: Concrete, actionable guidance for resume optimization.
- **Downloadable Report**: Candidates can export their full ATS audit as a text report with a single click.

### 3. Progressive 15-Question Curriculum Synthesis
- **Dynamic Question Generation**: Rather than pulling from a static spreadsheet, questions are synthesized dynamically by the LLM based on:
  - Target Job Role & Seniority (Years of Experience).
  - Target Job Description requirements.
  - Candidate's actual resume projects, languages, and frameworks.
- **Graduated Difficulty Curve**: Starts with a comfortable warm-up, progresses through core architecture, concurrency, trade-offs, and system design, concluding with behavioral leadership scenarios.

### 4. 1-Click Curated Practice Tracks
- Quick-start options on the candidate dashboard auto-populate interview parameters:
  - **System Design & Scalable Architecture**: Distributed caching, sharding, message queues, and partition tolerance (4 YOE).
  - **Navigating Tight Deadlines & Trade-offs**: Behavioral leadership, stakeholder conflict, and STAR methodology (3 YOE).
  - **Frontend Mastery & React 19**: Concurrent features, DOM rendering optimization, state architecture, and profiling (3 YOE).

### 5. Private In-Browser Camera Sandbox
- Provides a live video mirror so candidates can practice eye contact and posture in an authentic remote interview environment.
- **Zero Video Recording**: Camera video streams locally within the browser sandbox; video is never uploaded, recorded, or stored on any server.

### 6. Executive Performance Scorecard
- **Overall Score**: Weighted integer score from 0 to 100.
- **4 Core Competency Dimensions**:
  - Communication (clarity, pacing, rhythm).
  - Technical Skills (depth, architectural decisions, trade-offs).
  - Problem Solving (structured thinking, logical progression).
  - Confidence (executive presence and assertiveness).
- **Question-by-Question Reviews**: Complete transcript with individual question scores, exact spoken responses, and tailored AI feedback for each turn.
- **Executive Remarks**: High-level summary of strengths, weaknesses, and next-step recommendations.

---

## 💻 Tech Stack Summary

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Axios, React Router v7 |
| **Backend API** | Node.js 20+, Express 5, Mongoose 9, JWT, Bcrypt.js, Multer, Helmet, Express Rate Limit |
| **AI Backend** | Python 3.12, FastAPI, Uvicorn, Groq SDK, Motor (Async MongoDB), PyPDF, Python-docx, Pydantic |
| **Database** | MongoDB (Local Community Server or MongoDB Atlas) |
| **LLM Provider** | Groq (Llama 3 / Mixtral / OpenAI-compatible models) |
| **Browser APIs** | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), MediaDevices WebRTC (`getUserMedia`) |

---

## 📋 Prerequisites

Before running the application locally, ensure you have the following installed:

1. **Node.js**: `v20.0.0` or higher & `npm` (`v10+`).
2. **Python**: `3.10` or higher (`Python 3.12` recommended).
3. **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
4. **Groq API Key**: A free API key from [Groq Console](https://console.groq.com/).
5. **Modern Browser**: Google Chrome, Microsoft Edge, or any Chromium browser with microphone and camera permissions enabled for Web Speech API support.

---

## 🛠️ Local Development Setup

To run InterVue AI, start the **Node.js API**, the **FastAPI AI Service**, and the **Vite Web Client** in three separate terminal windows.

### 1. Configure and Start the Main API (`server/`)

Open Terminal 1 in the repository root:

```bash
cd server
npm install
```

Create `server/.env`:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/aiinterviewer
JWT_SECRET=your_super_secret_random_jwt_key_here
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=optional_service_secret
MAX_FILE_SIZE_MB=10
```

Start the Express development server:

```bash
npm run dev
```

- Server endpoint: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

---

### 2. Configure and Start the Python AI Service (`AiBackend/`)

Open Terminal 2 in the repository root:

```bash
cd AiBackend
```

Create a Python virtual environment and activate it:

```bash
# Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# macOS / Linux:
python3 -m venv .venv
source .venv/bin/activate
```

Install production dependencies:

```bash
pip install -r requirements-production.txt
```

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

Start the FastAPI application:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- AI Service endpoint: `http://localhost:8000`
- Health check: `http://localhost:8000/api/health`
- Interactive Swagger docs: `http://localhost:8000/docs`

---

### 3. Configure and Start the Web Client (`frontend/`)

Open Terminal 3 in the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

- Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables Reference

| Variable | Service | Required | Description | Default / Example |
| --- | --- | --- | --- | --- |
| `PORT` | Node API | No | Port on which the Express server listens | `5000` |
| `NODE_ENV` | Node API | No | Node environment mode (`development`, `production`) | `development` |
| `CLIENT_URL` | Node API | Yes | Frontend client origin for CORS configuration (comma-separated for multiples) | `http://localhost:5173` |
| `MONGO_URI` | Node & Python | Yes | MongoDB connection string (local or MongoDB Atlas) | `mongodb://127.0.0.1:27017` |
| `JWT_SECRET` | Node API | Yes | Secret key used to sign and verify candidate JWTs | Long random secret |
| `AI_SERVICE_URL` | Node API | Yes | Origin URL of the FastAPI AI backend (without trailing `/api`) | `http://localhost:8000` |
| `MAX_FILE_SIZE_MB` | Node API | No | Maximum uploaded resume file size in megabytes | `10` |
| `GROQ_API_KEY` | Python AI | Yes | Secret API key for Groq LLM inference | Secret API key |
| `GROQ_MODEL` | Python AI | No | Model identifier to use with the Groq client | `openai/gpt-oss-20b` |
| `MONGO_DB_NAME` | Python AI | No | Target MongoDB database name for AI sessions | `aiinterviewer` |
| `MAX_RESUME_SIZE_MB`| Python AI | No | Maximum resume text extraction payload size | `5` |
| `ALLOWED_ORIGINS` | Python AI | No | Comma-separated list of allowed CORS origins for FastAPI | `http://localhost:5173,http://localhost:5000` |
| `VITE_API_BASE_URL` | Frontend | Yes | Base URL for Node.js API (must end in `/api`) | `http://localhost:5000/api` |

---

## 📡 REST API Documentation

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register new candidate (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate candidate (`email`, `password`) & issue JWT |

### Candidate Profile (`/api/users`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users/me` | Protected | Fetch current authenticated candidate profile |
| `PATCH` | `/api/users/me` | Protected | Update profile details (`name`, `phone`, `profileImage`) |

### Resumes & ATS Audit (`/api/resumes`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/resumes/upload` | Protected | Upload multipart PDF/DOCX resume file & extract text |
| `GET` | `/api/resumes` | Protected | List all uploaded resumes for the candidate |
| `GET` | `/api/resumes/:id` | Protected | Get a specific resume and its latest analysis |
| `POST` | `/api/resumes/:id/analyze`| Protected | Run ATS audit against target role and job description |
| `DELETE`| `/api/resumes/:id` | Protected | Delete a resume record and local file |

### Interviews & Live Room (`/api/interviews`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/interviews` | Protected | Create draft interview (`resumeId`, `jobRole`, `experienceYears`, `jobDescription`) |
| `GET` | `/api/interviews` | Protected | List all candidate interview sessions |
| `GET` | `/api/interviews/:id` | Protected | Retrieve full interview session and performance report |
| `POST` | `/api/interviews/:id/start` | Protected | Record interview start time and initialize session |
| `POST` | `/api/interviews/:id/next-question` | Protected | Generate next spoken question, follow-up probe, or hint |
| `POST` | `/api/interviews/:id/complete` | Protected | Conclude interview, save transcript, and generate scorecard |

### Questions Blueprint (`/api/questions`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/questions/:id/generate` | Protected | Synthesize 15 custom progressive questions using AI |
| `GET` | `/api/questions/:id` | Protected | Retrieve generated planned questions for an interview |

### Internal FastAPI AI Endpoints (Port 8000)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/resume/parse` | Multipart document parser (PDF / DOCX text extraction) |
| `POST` | `/api/resume/analyze` | ATS compatibility, keyword match, and 5-section evaluation |
| `POST` | `/api/questions/generate` | Progressive multi-tiered interview question generator |
| `POST` | `/api/interview/next-question` | Adaptive turn logic, hints, follow-up checks, and anti-repetition filter |
| `POST` | `/api/interview/performance-report` | 4-dimension performance rubric scoring and question-by-question reviews |

---
## 🎙️ Speech & Audio Pipeline

1. **Browser Speech Recognition**: Handled via the browser's native `webkitSpeechRecognition` or `SpeechRecognition` API. Transcripts stream continuously into the candidate's active turn.
2. **Silence Detection Timers**:
   - Continuous speech resets the silence timer.
   - An **8-second pause** after speaking automatically triggers the turn submission.
   - A **15-second total silence** without any speech triggers Arya to gently repeat the question or offer a helpful hint.
3. **Speech Synthesis**: Handled via `window.speechSynthesis`. Voice synthesis matches installed browser voices (e.g., Google US English, Microsoft Jenny, Samantha).
4. **Visual State Sync**: Arya's portrait displays animated waveform visualizers while speaking and a glowing pulsing state while analyzing candidate answers.

---

## 🔒 Security & Privacy Practices

- **Zero Video Retention**: Video preview runs strictly on the client device through WebRTC `getUserMedia`. No video packets leave the user's browser.
- **Hashed Credentials**: Candidate passwords are encrypted using `bcryptjs` with salt rounds before being stored.
- **Stateless Authentication**: Access tokens are signed using JSON Web Tokens (JWT) with configurable expiry (`7d`).
- **Input Sanitization**: Express Rate Limiting guards against brute-force authentication and spam requests. File uploads are validated by MIME type, file extension, and strict size caps.
- **Configurable CORS Policies**: API gateway verifies and restricts cross-origin resource sharing strictly to configured frontend origins.

---

## 📄 License

This project is licensed under the **MIT License**.

Built with precision and passion by **[Pravesh Aggarwal](https://github.com/PraveshAggarwal)**.
