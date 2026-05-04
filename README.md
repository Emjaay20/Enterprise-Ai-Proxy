<div align="center">
  <h1>Aether Control ✣ Enterprise AI Proxy</h1>
  <p>High-performance semantic edge routing and telemetry for modern LLMs.</p>

  <br />

  ![Architecture](https://img.shields.io/badge/Architecture-Decoupled_Microservices-black?style=for-the-badge)
  ![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)
  ![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-black?style=for-the-badge&logo=nodedotjs)
  ![Supabase](https://img.shields.io/badge/Database-Supabase_pgvector-black?style=for-the-badge&logo=supabase)

</div>

---

## 📖 Overview

**Aether Control** is a drop-in proxy infrastructure designed to sit between your application and upstream LLM providers (e.g., Groq, OpenAI, Anthropic). 

By intercepting requests at the edge, Aether automatically tokenizes, embeds, and checks incoming prompts against a **Semantic Vector Cache**. If a similar prompt was recently answered, it serves the cached response instantly—slashing latency to under 20ms and completely eliminating upstream API costs.

The platform is split into two deeply integrated microservices:
1. **The Gateway Engine (`/ai-gateway`)**: A high-throughput Node.js Express server that handles the active proxying, local vector embedding generation (`Xenova/all-MiniLM-L6-v2`), and pgvector database matching.
2. **The Private Console (`/ai-dashboard`)**: A premium B2B SaaS Next.js dashboard where developers can create organizations, manage API keys, view live telemetry streams, and test the edge caching via a public/private playground.

---

## ✨ Key Features

- **Semantic Vector Caching:** Doesn't just match exact strings. Generates embeddings on the fly and hits the Supabase `pgvector` store to find >95% semantic matches.
- **Multi-Tenant Organization Architecture:** Secure Supabase Authentication (Email + GitHub OAuth) enforcing strict Row Level Security (RLS) so organizations can only access their own API keys and logs.
- **Enterprise Telemetry:** Logs the exact latency, token usage, and cache hit/miss status of every single request flowing through the proxy.
- **Vercel/Linear Aesthetic:** A strictly professional, highly polished dark-mode UI utilizing glassmorphic touches, stark borders, and bento-box layouts.
- **Zero-Friction Onboarding:** Dynamic layout that forces users to name their workspace upon first login before routing them to their private console.

---

## 🗂 Project Structure

```text
enterprise-ai-proxy/
│
├── ai-gateway/                # The Core Proxy Engine (Runs on :4000)
│   ├── src/controllers/       # Logic for semantic caching & proxying to Groq
│   ├── src/middlewares/       # Bearer token validation against Supabase
│   └── .env                   # Supabase Service Keys & Groq API Keys
│
└── ai-dashboard/              # The Next.js SaaS Console (Runs on :3000)
    ├── src/app/page.tsx       # Marketing Landing Page & Public Demo Playground
    ├── src/app/dashboard/     # Protected multi-tenant workspace (Keys, Logs)
    ├── src/app/api/proxy/     # Next.js route that securely hits the gateway for demos
    └── src/components/        # Reusable UI components (SiteHeader, TelemetryTable)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project (with `pgvector` enabled)
- A Groq API Key

### 1. Configure the Gateway (`/ai-gateway`)
Navigate to the gateway directory, install dependencies, and configure your environment:
```bash
cd ai-gateway
npm install
```
Create an `.env` file in `ai-gateway/`:
```env
PORT=4000
GROQ_API_KEY=your_groq_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```
Start the Gateway engine:
```bash
npm run dev
```

### 2. Configure the Dashboard (`/ai-dashboard`)
Open a new terminal window, navigate to the dashboard directory, and install dependencies:
```bash
cd ai-dashboard
npm install
```
Create an `.env.local` file in `ai-dashboard/`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GATEWAY_URL=http://localhost:4000
```
Start the Next.js development server:
```bash
npm run dev
```

### 3. Usage
- Visit `http://localhost:3000` to interact with the Public Playground on the landing page.
- Log in to create your Workspace Organization.
- Navigate to the **Keys** tab to generate your first `Aether API Key`.
- Route your OpenAI-compatible requests to `http://localhost:4000/v1/chat/completions` using your new API key as the Bearer token!

---

## 👨‍💻 Author

Built and designed by **Yusuf Saka**.
- **Portfolio:** [yusuf-saka-portfolio.vercel.app](https://yusuf-saka-portfolio.vercel.app/)
- **GitHub:** [@Emjaay20](https://github.com/Emjaay20)
- **LinkedIn:** [Yusuf Saka](https://www.linkedin.com/in/yusuf-saka/)
