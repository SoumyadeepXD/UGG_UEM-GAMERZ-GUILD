# 🎮 UGG (UEMK GAMERZ GUILD)

The official website for **UGG (UEMK GAMERZ GUILD)**, the premier collegiate gaming and esports society of the **University of Engineering & Management, Kolkata**.

---

## ✨ Features

- **🏆 Featured Showdowns Carousel:** Full-bleed cinematic tournament poster carousel with bottom vignette gradients, auto-sliding window, live timer bar, keyboard navigation, and mobile touch swiping.
- **⚡ Verified Registration Links:** Hardened, HTTPS-validated redirection to official tournament registration forms.
- **📱 Mobile-First Cyberpunk Palette:** Optimized for smartphone traffic arriving from Instagram and WhatsApp with pure dark backgrounds (`#060709`) and neon crimson accents (`#ff1e38`).
- **💬 Community Hub:** Quick access to the official UGG WhatsApp community channel, Discord server, Instagram, and YouTube.
- **🛡️ Coordinator Admin Portal (`/admin`):**
  - Managed via server-side session authentication with Supabase (Phase 2).
  - Production gate: Access is restricted in production until server-side authentication is deployed.
- **🚀 High-Performance Vercel Edge Hosting:** Built with Next.js 16 App Router using On-Demand Incremental Static Regeneration (ISR) for sub-50ms p95 page loads and resilience under traffic spikes (200+ concurrent visitors).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, On-Demand ISR)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/) + Custom SVG Brand Icons
- **Animation:** Hardware-accelerated CSS animations, `prefers-reduced-motion` compliance, and IntersectionObserver
- **Hosting:** Vercel Global Edge Network

---

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/SoumyadeepXD/UGG_UEM-GAMERZ-GUILD.git
   cd UGG_UEM-GAMERZ-GUILD
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Security & Access Control

- **Server-Side Session Gate:** Client-side hardcoded passkeys have been completely removed and burned.
- **Phase 1 Production Protection:** The `/admin` portal returns `404 Not Found` in production until Phase 2 Supabase Auth (HttpOnly cookies + MFA) is integrated.
- **URL Sanitization:** Tournament registration links are strictly validated for `https://` schemes before rendering as safe `rel="noopener noreferrer"` links to prevent stored XSS and open redirect vulnerabilities.

---

## 📜 License

Created for **UEMK Gamerz Guild (UGG)**. All rights reserved.
