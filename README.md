# Awami Kam (عوامی کام) — Pakistan's AI Voice-First Daily-Wage Marketplace

> **"عوامی کام — چوک کی لمبی قطاروں سے نجات"**  
> *Freedom from street-corner Chowk queues. Empowering daily-wage artisans and homeowners through voice-first AI matching and fair wage protection.*

---

## 👨‍💻 Developed By
**Sole Full-Stack Developer**: Built entirely by **Muzainah Faisal** as a complete end-to-end production solution for blue-collar empowerment.

---

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Proposed Solution](#proposed-solution)
3. [Project Description](#project-description)
4. [Technology Stack](#technology-stack)
5. [AI Methodology](#ai-methodology)
6. [AI Models and APIs Used](#ai-models-and-apis-used)
7. [What Makes Your Project Innovative](#what-makes-your-project-innovative)
8. [Setup & Installation](#setup--installation)
9. [App Screenshots Gallery](#app-screenshots-gallery)
10. [Git Commits & Version Control](#git-commits--version-control)

---

## 1. Problem Statement
**What problem are you solving?**
Daily-wage earners (painters, plumbers, electricians, masons, laborers) in Pakistan face severe economic vulnerability, lack of digital identity, and exploitation. They spend hours standing in street-corner "Chowk" queues exposed to weather, relying on exploitative middlemen who siphon their hard-earned wages. Simultaneously, homeowners and contractors struggle to find trusted, verified local artisans quickly and transparently.

---

## 2. Proposed Solution
**How does your product solve it?**
Awami Kam digitizes the unorganized blue-collar informal sector in South Asia. Unlike standard gig apps (like Upwork or TaskRabbit) that require high digital literacy, typing, and English proficiency, Awami Kam removes these barriers entirely through voice interaction in regional languages (Urdu, Punjabi, Pashto, Sindhi). Its **AI Fair Wage Engine** actively fights wage exploitation, while the **Chowk-to-Cloud** transition offers dignity, safety, and financial inclusion.

---

## 3. Project Description
**Describe product features, users, and applications...**
- **Dual User Roles**: Tailored portals for **Workers** (daily-wage artisans) and **Hirers** (homeowners and contractors).
- **Voice Assistant Agent**: Low-literacy workers and hirers can speak naturally to post jobs or accept gigs without typing.
- **Fair Wage Engine**: Automatically calculates and enforces fair market wages, preventing wage exploitation.
- **Smart GPS Matching & Zone Customization**: Workers select their preferred work zones across the city to receive targeted job requests.
- **Behavior & Rating Exchange**: Hirers and workers review each other's reliability, punctuality, and behavior after job completion.
- **Progressive Web App (PWA)**: Fully installable on Android/iOS/Desktop with offline resilience and local caching.

---

## 4. Technology Stack
**List the technologies used:**
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Realtime Subscriptions, Storage buckets for photos/audio).
- **AI & Voice Integration**: Google Gemini API (`@google/genai` SDK), Web Speech API.
- **PWA / Hosting**: Service Workers (`sw.js`), Web App Manifest (`manifest.json`), deployed on Vercel (`https://awami-kaam.vercel.app/`).

---

## 5. AI Methodology
**Explain how AI is used:**
Awami Kam uses multimodal AI to bridge the digital literacy gap:
1. **Natural Language Speech Parsing**: Converts unstructured spoken audio or text in regional languages (Urdu/English mix) into structured JSON objects containing trade category, task details, location, and budget.
2. **Economic Benchmarking (Fair Wage Engine)**: Compares offered rates against localized task-complexity databases to generate real-time wage fairness scores and warning advisories.
3. **Sentiment & Behavioral Scoring**: Analyzes post-job feedback text and ratings to compute trustworthiness indices for both workers and hirers.

---

## 6. AI Models and APIs Used
**AI Models and APIs Used:**
- **Model 1**: `gemini-3.8-flash` (Primary multimodal engine for voice transcription parsing, job description extraction, fair wage analysis, and behavioral sentiment scoring).
- **Model 2**: `gemini-3.8-flash-lite-tts` (Optimized text-to-speech generation for voice assistant feedback in regional languages).
- **Backend API Endpoints**:
  - `POST /api/gemini/worker-voice` — Parses spoken worker availability and skill intent.
  - `POST /api/gemini/hirer-job` — Parses unstructured hirer job descriptions into structured booking parameters.
  - `POST /api/gemini/fair-wage` — Evaluates fair wage compliance and generates economic advisory warnings.
  - `POST /api/gemini/voice-tts` — Synthesizes natural audio speech responses for low-literacy accessibility.
  - `POST /api/gemini/sentiment` — Evaluates review feedback and sentiment for reputation scoring.

---

## 7. What Makes Your Project Innovative?
- **Zero-Literacy Voice UX**: First-of-its-kind blue-collar marketplace in South Asia operated entirely through voice commands in regional languages.
- **Active Anti-Exploitation Wage Engine**: Unlike gig platforms that race to the bottom with lowest bids, Awami Kam mathematically enforces fair wages.
- **Chowk-to-Cloud Digital Identity**: Brings dignity and credit history to millions of informal street-corner workers.

---

## 8. Setup & Installation
1. **Clone Repository**:
   ```bash
   git clone https://github.com/Muzainah07/Awami-Kaam-.git
   cd awami-kam
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 9. App Screenshots Gallery
Here are screenshots of the Awami Kam platform across various views and user flows:

### Welcome & Onboarding
![Welcome Screen](docs/Screenshots/welcome.png)

### Hirer Portal & Booking Workflow
| Overview | Step 1 | Step 2 |
|:---:|:---:|:---:|
| ![Hirer Overview](docs/Screenshots/hirer.png) | ![Hirer 1](docs/Screenshots/hirer.1.png) | ![Hirer 2](docs/Screenshots/hirer.2.png) |
| Step 3 | Step 4 | Step 5 |
|:---:|:---:|:---:|
| ![Hirer 3](docs/Screenshots/hirer.3.png) | ![Hirer 4](docs/Screenshots/hirer.4.png) | ![Hirer 5](docs/Screenshots/hirer.5.png) |
| Step 6 | Step 7 | Step 8 |
|:---:|:---:|:---:|
| ![Hirer 6](docs/Screenshots/hirer.6.png) | ![Hirer 7](docs/Screenshots/hirer.7.png) | ![Hirer 8](docs/Screenshots/hirer.8.png) |

### Worker Portal & Live Radar
| Overview | Radar / Active | Job Match | Completion |
|:---:|:---:|:---:|:---:|
| ![Worker Overview](docs/Screenshots/worker.png) | ![Worker 1](docs/Screenshots/worker.1.png) | ![Worker 2](docs/Screenshots/worker.2.png) | ![Worker 3](docs/Screenshots/worker.3.png) |

---


