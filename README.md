<h1 align="center">
  <br>
  🎓 Skillbyte
  <br>
</h1>

<h3 align="center">A Full-Stack EdTech Platform for Modern Learning</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <a href="https://skillbyte.site/">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-folder-structure">Folder Structure</a>
</p>

---

## 🚀 Live Demo

> 🔗 **Live:** https:skillbyte.site  
> 📦 **Repository:** [github](https://github.com/muhammedRiyasck/skillbyte)

---

## 📖 Overview

**Skillbyte** is a production-ready, full-stack EdTech platform that connects students, instructors, and admins in a rich learning ecosystem. Built with a clean, scalable architecture and industry-grade tooling, Skillbyte supports everything from course creation and HLS video streaming to Google Gemini AI-powered quiz generation, real-time mentorship, gamification, and payment processing.

> Designed with **Clean Architecture** and **Domain-Driven Design** principles — every module is independently structured with its own domain, application, infrastructure, and entry-point layers.

---

## ✨ Features

### 👨‍🎓 Student
- Browse, search, and filter courses by category, level, and language
- Enroll in courses with one-click purchase (Stripe or PayPal)
- Watch HLS-streamed video lessons with `video.js` player
- Track progress per module and lesson
- Take AI-generated assessments (Google Gemini) and unlock verified certificates upon passing
- Download beautifully generated PDF certificates on course completion
- Earn XP and badges through the gamification system
- Chat with instructors in real-time
- Book 1-on-1 mentorship sessions with live video calls (WebRTC)
- Leave reviews and ratings for courses
- Receive real-time in-app notifications

### 👨‍🏫 Instructor
- Create and manage courses with a rich course builder (modules, lessons, thumbnails)
- Upload video lessons — automatically transcoded to HLS with `ffmpeg`
- Configure automated AI assessments using Google Gemini (custom focus topics, difficulty, question counts)
- View earnings dashboard with payout requests
- Manage student enrollments and progress
- Chat with enrolled students
- Offer mentorship sessions and manage bookings

### 🛡️ Admin
- Full platform oversight: manage students, instructors, and courses
- Approve or block instructors and courses
- View platform-wide reports and analytics
- Handle instructor withdrawal/payout requests
- Manage categories and platform configuration

### 💳 Payments & Monetization
- **Stripe** integration with webhook event handling for real-time payment confirmation
- **PayPal** integration as an alternative checkout option
- Instructor revenue tracking with withdrawal request workflow
- Secure raw webhook endpoint for Stripe events (pre-middleware raw body parsing)

### 🎥 Video & Streaming
- Videos transcoded to **HLS (HTTP Live Streaming)** using `fluent-ffmpeg`
- Chunked video delivery via signed URLs from **Backblaze B2**
- HLS playlist URL rewriting script for CDN compatibility
- `video.js` player on the frontend with adaptive quality playback

### 💬 Real-Time Communication
- **Socket.IO** for real-time chat (student ↔ instructor)
- Emoji picker, message timestamps, and chat history
- **WebRTC** video calls for live mentorship sessions
- Real-time notification delivery via sockets

### 🤖 AI-Powered Quizzes & Assessments (Google Gemini)
- **Automated Question Synthesis:** Instructors specify focus topics, difficulty levels (easy, medium, hard, mixed), and question count; Google Gemini AI (`@google/generative-ai`) dynamically synthesizes relevant multiple-choice questions with answer choices and detailed explanations.
- **Enterprise-Grade AI Architecture:** Built with automatic multi-API key rotation, strict JSON schema parsing, fallback model cascading, and validation guards to eliminate hallucinations.
- **Timed Assessment Interface:** Interactive student testing session featuring real-time countdown timer, question navigator, and automatic submission upon time expiry.
- **Instant Evaluation & Breakdown:** Immediate scoring, question-by-question review, and explanations for correct answers.
- **Instructor Quiz Analytics:** Comprehensive analytics dashboards displaying pass/fail rates, average scores, and student attempt histories.
- **Certification Pathway:** Dynamic prerequisite check requiring students to achieve passing grades before issuing course certificates.

### 🏆 Gamification
- XP points awarded on lesson completion
- Badge system for milestones (first course, quiz ace, etc.)
- Progress tracking with visual indicators

### 🔐 Authentication & Security
- JWT-based authentication with HTTP-only cookies
- **Google OAuth 2.0** and **Facebook OAuth** via Passport.js
- OTP-based email verification (Nodemailer + Resend)
- Role-based access control (Student / Instructor / Admin)
- Helmet.js for HTTP security headers
- Rate limiting (1000 req / 15 min per IP)
- Zod schema validation on all API inputs

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **TypeScript 5.8** | Type safety |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Redux Toolkit** | Global state management |
| **TanStack Query v5** | Server state & caching |
| **React Router DOM v7** | Client-side routing |
| **Framer Motion** | Animations & transitions |
| **Socket.IO Client** | Real-time communication |
| **Stripe.js / PayPal JS** | Payment UI integration |
| **video.js** | HLS video player |
| **React Hook Form** | Form management |
| **Recharts** | Analytics dashboards |
| **jsPDF + html2canvas** | Certificate PDF generation |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server & REST API |
| **TypeScript 5.8** | Type safety |
| **MongoDB + Mongoose 8** | Primary database |
| **Redis (ioredis)** | Caching & session store |
| **Socket.IO** | Real-time events |
| **Bull** | Background job queue |
| **fluent-ffmpeg** | Video transcoding to HLS |
| **Passport.js** | OAuth (Google + Facebook) |
| **JWT + bcryptjs** | Auth & password hashing |
| **Stripe + PayPal** | Payment processing |
| **Nodemailer + Resend** | Email delivery |
| **Cloudinary** | Image/thumbnail uploads |
| **Backblaze B2 + AWS S3 SDK** | Video storage & signed URLs |
| **Zod** | Input schema validation |
| **Helmet + express-rate-limit** | Security hardening |
| **Winston** | Structured logging |
| **Jest + ts-jest** | Unit & integration testing |
| **Google Gemini AI** | Dynamic assessment & quiz question synthesis (`@google/generative-ai`) |

### Infrastructure & DevOps
| Technology | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerized deployment |
| **Nginx** | Reverse proxy for frontend |
| **Vercel** | Client-side deployment |
| **MongoDB 6** | Primary database |
| **Redis 7 Alpine** | Caching layer |
| **Backblaze B2** | Object storage for HLS video |

---

## 🏗️ Architecture

Skillbyte follows **Clean Architecture** with **Domain-Driven Design (DDD)** principles. Every server module is structured into four isolated layers:

```
modules/<module>/
├── domain/              # Pure business entities & repository interfaces
│   ├── entities/        # Core domain objects (Course, Lesson, Payment...)
│   └── IRepositories/   # Repository contracts (interfaces only)
├── application/         # Use cases & business logic
│   └── use-cases/       # One class per use case
├── infrastructure/      # Framework & DB implementations
│   ├── repositories/    # Mongoose implementations of domain repositories
│   └── models/          # Mongoose schemas/models
└── entry-point/         # Express controllers, routes, DI container
    ├── controllers/
    ├── routes/
    └── dependencyInjection/
```

### Server Modules

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, OTP, OAuth, JWT refresh |
| `course` | Course CRUD, modules, lessons, HLS upload |
| `enrollment` | Enrollment tracking, progress |
| `quiz` | AI quiz generation (Google Gemini), attempts, analytics & scoring |
| `certificate` | Certificate generation & storage |
| `payment` | Stripe/PayPal checkout, webhooks, withdrawals |
| `chat` | Real-time messaging via Socket.IO |
| `mentorship` | Session booking, management |
| `notification` | In-app + real-time notifications |
| `review` | Course ratings & reviews |
| `report` | Admin analytics & reporting |
| `student` | Student profile management |
| `instructor` | Instructor profile & earnings |
| `admin` | Admin controls & overrides |

### Frontend Architecture

```
client/src/
├── app/              # App root, router, store setup
├── features/         # Feature-sliced modules (auth, course, chat...)
│   └── <feature>/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/  # API calls (Axios)
│       ├── types/
│       └── validation/
├── shared/           # Reusable UI components, hooks, utilities
├── context/          # React context providers
├── core/             # Axios instance, route guards, constants
└── layouts/          # Page layout wrappers
```

---

## 🖼️ Screenshots (some)


| Home Page(light mode)| Home Page(dark mode) | Course Detail | Student Dashboard |
|---|---|---|---|
| <img width="1883" height="918" alt="Image" src="https://github.com/user-attachments/assets/561539ab-1f2b-40a3-a9a7-1bb0f462d2b0" /> | <img width="1882" height="910" alt="Image" src="https://github.com/user-attachments/assets/4a620ae4-bf20-4535-a553-785f49fc8e6e" /> | <img width="1882" height="905" alt="Image" src="https://github.com/user-attachments/assets/2d10c5fd-cad7-497f-8da8-c03fadb0c182" /> | <img width="1887" height="912" alt="Image" src="https://github.com/user-attachments/assets/1ec8a743-3949-4442-b0f0-06bbf12ae4d4" /> |

| Instructor Dashboard | course creation base info | Ai Quiz |
|---|---|---|
| <img width="436" height="878" alt="Image" src="https://github.com/user-attachments/assets/2db6e9a6-2848-48d9-a739-9db8f9651838" />
 | <img width="1883" height="903" alt="Image" src="https://github.com/user-attachments/assets/f1db439d-f036-4598-8eea-5b7c578bac2c" />
 | <img width="1883" height="906" alt="Image" src="https://github.com/user-attachments/assets/dbde36b8-7d56-4b38-a20e-76b13e5f48bc" />
 |

| Admin Dashboard | Admin Menu | Moderation Center | Withdrawal Management |
|---|---|---|---|
| <img width="1872" height="903" alt="Image" src="https://github.com/user-attachments/assets/35aac153-6868-438e-aa86-31c1deeda55b" /> | 
| <img width="1880" height="882" alt="Image" src="https://github.com/user-attachments/assets/fb05ff38-e619-4e3a-847b-45a2e2bcb29f" />|
| <img width="1892" height="906" alt="Image" src="https://github.com/user-attachments/assets/5d150a88-e5f9-4446-8f12-e70d1c0fa914" />|
<img width="1887" height="906" alt="Image" src="https://github.com/user-attachments/assets/9b44d4af-56ad-4698-bb66-44ee8aa095a4" />|

| Course Detail | Course Player | Certificate |
|---|---|---|
<img width="1480" height="900" alt="Image" src="https://github.com/user-attachments/assets/beeb15ff-c1a3-4e65-a180-ae18d556ee1a" /> |
<img width="1877" height="901" alt="Image" src="https://github.com/user-attachments/assets/a85c70bd-bc20-405d-a1e3-41f600c185e7" /> |
<img width="1886" height="897" alt="Image" src="https://github.com/user-attachments/assets/53aa395b-5cef-44b8-a6c3-e8c083039cca" /> |

| Lobby | video call  | slot booking | my bookings | Chat |
|---|---|---|---|---|
<img width="1896" height="907" alt="Image" src="https://github.com/user-attachments/assets/08812515-edc7-441e-a765-ea6b93257dfa" /> |
<img width="1895" height="910" alt="Image" src="https://github.com/user-attachments/assets/bfc9b0ed-bf12-4c20-9dea-50e3e0a9d03a" /> | 
<img width="1895" height="915" alt="Image" src="https://github.com/user-attachments/assets/b55dc7db-5797-44a5-88e0-2f2fc34c00a9" /> | 
<img width="1886" height="902" alt="Image" src="https://github.com/user-attachments/assets/be12af6f-6acf-4433-959e-11fae6679671" />|
<img width="1897" height="908" alt="Image" src="https://github.com/user-attachments/assets/9dbb549f-358c-42af-b502-ef2c1d52493f" />|

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v18+
- **Docker** & **Docker Compose** (for containerized setup)
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)

### 1. Clone the Repository

```bash
git clone <https://github.com/muhammedRiyasck/skillbyte>
cd Skillbyte
```

### 2. Environment Variables

**Server** — create `server/.env`:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/skillbyte
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Backblaze B2
B2_APPLICATION_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=

# Email
RESEND_API_KEY=
NODEMAILER_USER=
NODEMAILER_PASS=

# AI / Google Gemini
GEMINI_API_KEY=
```

**Client** — create `client/.env`:
```env
VITE_API_URL=/api/v1
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_URL=http://localhost:5173
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=...
```

### 3. Run with Docker (Recommended)

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

### 4. Run Manually

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

---

## 📁 Folder Structure

```
Skillbyte/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/
│   │   │   ├── course/
│   │   │   ├── enrollment/
│   │   │   ├── quiz/
│   │   │   ├── certificate/
│   │   │   ├── chat/
│   │   │   ├── mentorship/
│   │   │   ├── gamification/
│   │   │   ├── notification/
│   │   │   ├── review/
│   │   │   ├── admin/
│   │   │   ├── instructor/
│   │   │   └── student/
│   │   ├── shared/
│   │   ├── context/
│   │   ├── core/
│   │   └── layouts/
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── modules/          # 14 DDD modules
│   │   ├── shared/           # Cross-cutting concerns
│   │   │   ├── config/       # DB, Redis, Passport, Backblaze
│   │   │   ├── middlewares/
│   │   │   ├── repositories/
│   │   │   ├── services/     # Email, OTP
│   │   │   └── utils/        # Logger, helpers
│   │   ├── routes/           # Root router
│   │   ├── app.ts
│   │   └── server.ts
│   └── Dockerfile
│
└── docker-compose.yml        # Full-stack orchestration
```

---

## 🔐 Security Highlights

| Feature | Details |
|---|---|
| 🛡️ **Helmet.js** | Secure HTTP headers (XSS, clickjacking, MIME-sniffing) |
| ⏱️ **Rate Limiting** | 1000 requests / 15 minutes per IP |
| 🔑 **JWT** | Short-lived access tokens + HTTP-only refresh cookies |
| 🔒 **bcryptjs** | Salted password hashing |
| 🌐 **OAuth 2.0** | Google & Facebook via Passport.js |
| ✅ **Zod** | All API inputs schema-validated |
| 🔗 **CORS** | Strict origin whitelisting |
| 📩 **OTP** | Email-based account verification |

---

## 🧪 Testing

```bash
# Run server unit tests
cd server
npm run test

# Run with coverage report
npm run test:cov
```

> Tests written with **Jest** and **ts-jest**.

---

## 📜 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Muhammed Riyas**  
Full-Stack Developer

> *Built as a major project demonstrating real-world engineering practices: Clean Architecture, Domain-Driven Design, real-time systems, HLS video streaming, payment integration, and containerized deployment.*
