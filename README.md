<div align="center">

# 🚀 G I T  J O U R N E Y 
### The Interactive 3D Path to Version Control Mastery

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

<br />

### 🛑 Stop memorizing commands. Start seeing them.
**[👉  TOUCH GRASS (LIVE DEMO)  👈](https://gitjourney-sable.vercel.app/)**

</div>

---

## 💅 The Vibe Check (What is this?)

Let’s be real—staring at a terminal trying to visualize a `git rebase` is absolute torture. 

**GitJourney** is a gamified, interactive platform that turns the boring command line into a **visual 3D experience**. We visualize the Git DAG (Directed Acyclic Graph) in real-time, helping you build a mental model of branches, commits, and tags.

From **"I deleted main by accident"** (Level 1) to **"I rewrite history for fun"** (Level 3) — we got you.

---

## 📸 Visuals

| **The Landing** | **The Curriculum** |
|:---:|:---:|
| ![Landing](<img width="1919" height="938" alt="Screenshot 2025-11-20 230454" src="https://github.com/user-attachments/assets/0589f814-29a7-4722-9c18-31f7d475156c" />
) | ![Curriculum](<img width="1919" height="937" alt="Screenshot 2025-11-20 230641" src="https://github.com/user-attachments/assets/c23f2582-6fb7-45b6-aa27-368b310b17c0" />
) |
| *Animated 3D Shaders & Glassmorphism* | *Gamified Progress Tracking* |

> Workspace
> <img width="1919" height="942" alt="Screenshot 2025-11-20 230733" src="https://github.com/user-attachments/assets/4ee1eb31-66fd-49a3-879b-f31f51844c34" />


---

## 🔥 Why It Slaps (Features)

* **Main Character Energy:** You aren't just typing; you're moving through a 3D Canvas seeing your repo update in real-time.
* **23+ Interactive Levels:** From `git init` to `git cherry-pick`.
* **Visual Git Canvas:** See branches diverge and merge visually.
* **Sandbox Mode:** A free-play zone to experiment (and break things) without consequences.
* **Gamified:** Earn badges, track time, and unlock achievements.

---

## 🏎️ The Flex (Engineering & Optimization)

Most 3D websites turn your laptop into a jet engine. **Not this one.** We engineered this to be **production-ready**. 

Here is the technical wizardry used to keep it hitting **60FPS on mobile**:

### ⚡ Hybrid Rendering Stack
We use a **Hybrid Stack**—HTML for the UI/Text and WebGL *only* for the 3D assets. It keeps the DOM light and the GPU happy.

### 🔋 Battery Saver Mode (`frameloop="demand"`)
We implemented on-demand rendering. The GPU literally sleeps when you are reading the guide or typing. Your phone battery will thank us later.

### 📱 Mobile Scaling (DPR Clamping)
Retina screens usually kill WebGL performance (rendering 3x pixels).
* **The Fix:** We clamped the DPR (Device Pixel Ratio) to `1.5` on mobile.
* **The Result:** Crispy visuals, zero lag, looks native.

### 🎨 Custom Shaders
The background isn't a video—it's a mathematical shader (`ColorBends.tsx`) running on the GPU, creating smooth, non-repetitive visuals without heavy asset downloads.

---

## 🥞 The Stack

| Category | Tech |
| :--- | :--- |
| **Framework** | React 19 (TypeScript) |
| **Build Tool** | Vite 6.2 |
| **3D Engine** | Three.js + React Three Fiber |
| **Styling** | Tailwind CSS (Glassmorphism) |
| **Icons** | Lucide React |
| **Logic** | Custom Git Simulation Engine (`gitLogic.ts`) |

---

## 🎓 Curriculum Breakdown

<details>
<summary>Click to see full lesson list</summary>

1.  **Introduction to Git** - Basic concepts
2.  **Initializing** - `git init`
3.  **Committing** - `git add` & `git commit`
4.  **History** - `git log`
5.  **Branching** - `git branch` & `checkout`
6.  **Merging** - `git merge`
7.  **Remote** - `git push` & `pull`
8.  **Advanced:** Stashing, Tagging, Rebasing, Cherry-picking, Resetting, and Reverting.

</details>

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

# 4. Start the engine
npm run dev
Open http://localhost:3000 and watch the magic happen.

📁 Project Structure
Bash

gitjourney/
├── components/          # React components
│   ├── ColorBends.tsx   # ✨ Custom 3D Shaders
│   ├── GitCanvas.tsx    # 🧠 The Visualization Logic
│   └── ...
├── utils/               # Logic Layer
│   ├── gitLogic.ts      # ⚙️ The Simulation Engine
│   └── lessonGuides.ts
└── App.tsx              # Main Entry
🤝 Contributing
See a bug? That's kinda cringe. Fix it and submit a PR!

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

<div align="center">

Made with 🖤 and ☕ by Praveen
Don't forget to ⭐ star the repo if you learned something!

</div>
