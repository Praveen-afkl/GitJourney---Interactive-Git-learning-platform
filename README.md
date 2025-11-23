<div align="center">

# 🚀 G I T  J O U R N E Y 
### The Interactive 3D Path to Version Control Mastery

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)
![Status](https://img.shields.io/badge/Status-Bussin-success?style=for-the-badge)

<br />

### 🛑 Stop memorizing commands. Start seeing them.
**[👉  TOUCH GRASS (LIVE DEMO)  👈](https://gitjourney-sable.vercel.app/)**

</div>

---

## 🛸 The Vibe Check (What is this?)

Let’s be real—staring at a black-and-white terminal trying to visualize a `git rebase` is torture.

**GitJourney** is a gamified, interactive platform that turns the abstract mental model of Git into a **visual 3D experience**. We visualize the Git DAG (Directed Acyclic Graph) in real-time, helping you understand branches, commits, and the dreaded HEAD pointer.

From **"I deleted main by accident"** (Level 1) to **"I rewrite history for fun"** (Level 3) — we got you.

### 📸 The Landing Zone
![Landing Page]
<img width="1919" height="938" alt="Screenshot 2025-11-20 230454" src="https://github.com/user-attachments/assets/bbebe9ef-cd77-4fec-b275-afd49e80dfcc" />

> *A modern, high-performance landing page that sets the stage for the simulation.*

---

## 🔥 Why It Slaps (Key Features)

We didn't just build another tutorial site. We built a simulation.

### 1. Gamified Progress Tracking
Ditch the boring checklists. Your journey is visualized as a 3D path. Track your stats, earn achievements for mastering complex concepts, and see exactly how far you've come on the road to Git mastery.

![Mission Control & Roadmap](<img width="1919" height="937" alt="Screenshot 2025-11-20 230641" src="https://github.com/user-attachments/assets/49f65f1a-698e-4ecc-b298-6f9545e446a8" />
)

### 2. The Interactive Workspace
This is where the magic happens. We combine three distinct layers into one seamless experience:
1.  **The Guide (Left):** Clear, step-by-step instructions and theory.
2.  **The Visualizer (Center):** A real-time view of your repository state (currently showing the "System Offline" state before initialization).
3.  **The Terminal (Right):** A functional terminal emulator where you type real Git commands to drive the simulation.

![Interactive Workspace](<img width="1919" height="942" alt="Screenshot 2025-11-20 230733" src="https://github.com/user-attachments/assets/8e7ef1fd-73c0-4bee-a1c7-9facbaa0360a" />
)

---

## 🏎️ The Flex (Engineering & Optimization)

Most 3D websites turn your laptop into a jet engine and kill mobile batteries. **Not this one.**

We engineered GitJourney with a "Performance-First" mindset to ensure it hits **60FPS on mobile devices**. Here is the technical wizardry under the hood:

### ⚡ Hybrid Rendering Stack
We don't dump everything into the 3D Canvas. We use a **Hybrid Stack**—HTML for the UI/Text and WebGL *only* for the 3D assets. This keeps the DOM accessible and the GPU focused only on what matters.

### 🔋 Battery Saver Mode (`frameloop="demand"`)
A learning platform is mostly static while you read. We implemented **on-demand rendering**. The GPU literally sleeps when you aren't interacting with the 3D scene.

### 📱 Mobile Scaling (DPR Clamping)
Retina screens try to render at 3x resolution, which kills mobile GPUs.
* **The Fix:** We actively clamp the Device Pixel Ratio (DPR) to a maximum of `1.5` on mobile.
* **The Result:** Crispy visuals, zero lag, and it feels native.

### 🧩 Geometry Instancing
We don't render 100 separate items in the background. We use **GPU Instancing** to render repeated geometry in a **single draw call**, massively reducing CPU overhead.

---

## 🥞 The Stack

| Category | Tech |
| :--- | :--- |
| **Framework** | React 19 (TypeScript) |
| **Build Tool** | Vite 6.2 |
| **3D Engine** | Three.js + React Three Fiber |
| **Styling** | Tailwind CSS (Glassmorphism) |
| **State** | React Hooks + Custom Context |
| **Simulation** | Custom Git Logic Engine (`gitLogic.ts`) |

---

## 🏃‍♂️ Run It Locally

Wanna look under the hood? Bet.

```bash
# 1. Clone this repo
git clone [https://github.com/Praveen-afkl/GitJourney---Interactive-Git-learning-platform.git](https://github.com/Praveen-afkl/GitJourney---Interactive-Git-learning-platform.git)

# 2. Slide into the directory
cd GitJourney---Interactive-Git-learning-platform

# 3. Install the goods
npm install 
# or
yarn install

# 4. Start the engine
npm run dev
Open http://localhost:3000 and enter the simulation.

<div align="center">

Made with 🖤 and ☕ by Praveen
Don't forget to ⭐ star the repo if you learned something!

</div>
