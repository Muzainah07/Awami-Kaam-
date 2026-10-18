# Awami Kam (عوامی کام)
Voice-first daily-wage marketplace for Pakistan.

**Note:** Login uses a phone number and PIN for this demo. Phone numbers are not yet verified. SMS verification through a local Pakistani gateway is the first launch step, and the code path is already built behind a switch.

[FILL IN: Live demo link placeholder (Vercel URL)]
[FILL IN: Demo video link placeholder]

![TypeScript](https://img.shields.io/badge/typescript-blue)
![React](https://img.shields.io/badge/react-blue)
![Supabase](https://img.shields.io/badge/supabase-green)
![Gemini](https://img.shields.io/badge/gemini-orange)
![PWA](https://img.shields.io/badge/pwa-blue)

---

## 1. Problem
Daily-wage workers (painters, plumbers, electricians, carpenters, masons, laborers) often wait at city chowks at 6 AM hoping to be hired; if not picked, they earn nothing that day. This leads to lost income and financial instability. Key barriers include:
*   **Literacy and Language Barriers**: Workers often speak regional languages (Urdu, Punjabi, Pashto, Sindhi, Saraiki) and may have low literacy, making text-based platforms inaccessible.
*   **Lack of Price Transparency**: Often results in underpayment due to informal negotiations.
*   **Trust and Speed**: Hirers struggle to find trustworthy workers quickly for urgent home repairs.

[FILL IN: Source for daily wage worker statistics in Pakistan]

## 2. Solution
Awami Kam is a two-sided marketplace designed to bridge this gap:
*   **Dual-App Ecosystem**: Separate apps for workers and hirers, powered by a unified account system.
*   **Voice-First Experience**: A zero-text worker interface utilizing advanced AI for onboarding and communication.
*   **AI Fair Wage Engine**: Provides price benchmarks based on skill, area, and complexity, ensuring transparency and fair pay.
*   **Hybrid Smart Matching**: Matches hirers with workers based on location, skill, and trust score, utilizing inDrive-style price negotiation.

**A Day in Ahmed’s Life**: Ahmed, a painter from Liaquatabad, logs in via voice. His profile is automatically created. He toggles his status to "Online". By 8 AM, he receives a voice-based job offer in his language for a painting job in Gulshan-e-Iqbal. He accepts, navigates to the location using the app, completes the job, and gets paid, all without typing a single word.

## 3. Features
### Worker App
*   **Voice Onboarding**: Create a professional profile using only voice.
*   **Availability Toggle**: Simple online/offline toggle.
*   **Job Offers**: Full-screen offer cards with countdowns.
*   **Voice-Note Communication**: Receive job details in the worker's native language.
*   **Counter Offers**: InDrive-style negotiation.
*   **Active Job Tracking**: Live tracking to site.
*   **Voice Feedback**: Voice-based ratings for hirers.
*   **Earnings & Trust Score**: Real-time earnings dashboard and reliability metrics.
*   **Voice Assistant**: Hands-free assistance for job info, earnings, and status.

### Hirer App
*   **Booking Wizard**: Step-by-step guided flow for hiring.
*   **Photo-to-Quote**: Snap a photo of the problem; AI analyzes and provides a cost/materials estimate.
*   **Fair Price Slider**: Transparent pricing guided by AI benchmarks.
*   **Ranked Matching**: View matches with "why matched" explanations.
*   **Live Tracking**: Track the worker's arrival.

### Platform
*   **Realtime**: Instant job broadcasts and status updates.
*   **PWA**: Installable for offline resilience.
*   **i18n**: Full support for Urdu, English, Pashto, Sindhi, and Punjabi with RTL layout.
*   **Demo Mode**: Dedicated `/demo` route with synthetic history for testing and Impact Dashboard.

## 4. Tech Stack
| Layer | Technology | Why |
| :--- | :--- | :--- |
| Frontend | React + Vite + Tailwind | Fast SPA, modern UI, responsive. |
| Database | Supabase (PostgreSQL) | Realtime, managed Auth, robust RLS. |
| AI | Gemini Flash | High-speed multimodal (vision/text) processing. |
| PWA | Vite PWA Plugin | Offline capability, installability. |

## 5. Setup Steps
1.  **Clone the repository**: `git clone <repo-url>`
2.  **Install dependencies**: `npm install`
3.  **Environment Variables**: Create a `.env` file based on `.env.example`.
4.  **Supabase Setup**: Connect your Supabase project URL and Anon Key.
5.  **Run Development Server**: `npm run dev`

## 6. AI Methodology & Model Usage
AI is used to enable the voice-first experience and fair pricing.
1.  **Multilingual Speech Understanding**: Uses Gemini Flash for transcribing and extracting intent/entities (skill, area, rate) from regional audio notes.
2.  **Photo-to-Quote**: Vision analysis via Gemini Flash to estimate job type, severity, materials, and effort from photos.
3.  **Fair Wage Engine**: Logic-based assessment using base skill rates, complexity multipliers, and regional adjustments as a source of truth.

## 7. Screenshots
[FILL IN: Placeholder for screenshots (e.g., Worker Home, Hirer Booking Wizard, Impact Dashboard)]

## 8. Team Member Contributions
[FILL IN: Placeholder for team member names and individual contributions]

## 9. Roadmap
*   [ ] Implement real-time voice chat integration.
*   [ ] Expand regional language support (Saraiki, Brahui).
*   [ ] Integrate local SMS gateway for non-demo environments.
*   [ ] Advanced demand forecasting with historical data.
