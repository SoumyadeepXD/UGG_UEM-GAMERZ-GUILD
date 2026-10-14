# 🎮 UGG (UEMK GAMERZ GUILD)

The official website for **UGG (UEMK GAMERZ GUILD)**, the premier collegiate gaming and esports society of the **University of Engineering & Management, Kolkata**.

🌐 **Live Website:** [https://soumyadeepxd.github.io/UGG_UEM-GAMERZ-GUILD/](https://soumyadeepxd.github.io/UGG_UEM-GAMERZ-GUILD/)

---

## ✨ Features

- **🏆 Featured Showdowns Carousel:** Full-bleed cinematic tournament poster carousel with bottom vignette gradients, 5-second automatic sliding windows, top countdown timer line, and mobile touch swiping.
- **⚡ 1-Tap Google Form Registration:** Immediate redirection to official Google Forms on tournament card or button click.
- **📱 Mobile-First OLED Palette:** Optimized for smartphone traffic arriving from Instagram and WhatsApp with pure dark backgrounds (`#060709`) and neon crimson accents (`#ff1e38`).
- **💬 Community Hub:** Quick access to the official UGG WhatsApp community channel, Discord server, Instagram, and YouTube.
- **🛡️ Coordinator Admin Portal (`/admin`):**
  - Passkey protected (Default: `ugg2026`).
  - Add new tournaments with live poster card previews.
  - Manage existing tournaments (Active, Upcoming, Completed).
  - Optional live synchronization via Google Sheets CSV.
  - Offline JSON data export and backup.
- **🚀 Automated GitHub Pages Deployment:** Built as a static export using Next.js 16 and automated with GitHub Actions.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Static HTML Export)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/) + Custom SVG Brand Icons
- **Animation:** Native hardware-accelerated CSS animations & IntersectionObserver
- **Hosting:** GitHub Pages via GitHub Actions

---

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/SoumyadeepXD/UGG_UEM-GAMERZ-GUILD.git
   cd UGG_UEM-GAMERZ-GUILD
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Coordinator Portal

To manage tournaments locally or on the live site:
1. Navigate to `/admin` (e.g., `https://soumyadeepxd.github.io/UGG_UEM-GAMERZ-GUILD/admin/`).
2. Enter the passkey: `ugg2026`.
3. Add, edit status, or remove tournament listings. Changes persist locally and reflect immediately.

---

## 📜 License

Created for **UEMK Gamerz Guild (UGG)**. All rights reserved.
