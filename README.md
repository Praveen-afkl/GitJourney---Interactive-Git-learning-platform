<div align="center">

# 🚀 GitJourney

**Interactive Git Learning Platform - Master Version Control Through Hands-On Practice**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)

*Learn Git commands through an interactive, gamified experience with visual feedback and real-time progress tracking.*

</div>

---

## 📸 Screenshots

### Landing Page
<img width="1919" height="938" alt="image" src="https://github.com/user-attachments/assets/cf722aca-4069-4948-b390-271b16c658cb" />

*Beautiful landing page with animated background and glass morphism effects*

### Curriculum View
![Curriculum View](./screenshots/curriculum-view.png)
*Interactive curriculum map showing all lessons and your progress*

### Workspace
![Workspace](./screenshots/workspace.png)
*Interactive workspace with Git canvas visualization, terminal, and guide panel*

### Lesson Completion
![Lesson Completion](./screenshots/lesson-completion.png)
*Celebration animation when completing lessons*

---

## ✨ Features

### 🎯 **Interactive Learning**
- **23+ Comprehensive Lessons** covering Git fundamentals to advanced workflows
- **Visual Git Canvas** showing repository state, branches, commits, and tags in real-time
- **Interactive Terminal** with command history and auto-completion
- **Step-by-Step Guides** with hints and examples for each lesson

### 🎨 **Beautiful UI/UX**
- **Modern Design** with dark/light mode support
- **Animated Background** using Three.js shaders (ColorBends)
- **Glass Morphism Effects** on landing page and components
- **Responsive Design** optimized for desktop, tablet, and mobile devices
- **Smooth Animations** and transitions throughout

### 🎮 **Gamified Experience**
- **Progress Tracking** with percentage completion
- **Achievement Badges** for milestones
- **Lesson Unlocking** system based on completion
- **Time Tracking** for each lesson
- **Command History** export functionality

### 🛠️ **Advanced Features**
- **Free Play Sandbox** mode for experimentation
- **Undo/Redo** functionality for Git operations
- **Feature Guide** with interactive tour
- **Command Reference** modal with all Git commands
- **Local Storage** persistence for progress and preferences

### 🚀 **Performance Optimized**
- **Code Splitting** with lazy loading for optimal bundle size
- **Vendor Chunking** for better caching
- **Optimized Build** with esbuild minification
- **Fast Load Times** with efficient asset management

---

## 🏗️ Tech Stack

- **Frontend Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect, useMemo, useCallback)
- **Deployment:** Vercel (configured)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Praveen-afkl/GitJourney---Interactive-Git-learning-platform.git
   cd GitJourney---Interactive-Git-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

---

## 🎓 Lessons Covered

1. **Introduction to Git** - Basic concepts and setup
2. **Initializing Repository** - `git init`
3. **Making Commits** - `git add` and `git commit`
4. **Viewing History** - `git log`
5. **Branching Basics** - `git branch` and `git checkout`
6. **Merging Branches** - `git merge`
7. **Remote Repositories** - `git remote` and `git push`
8. **Pulling Changes** - `git pull`
9. **Stashing Changes** - `git stash`
10. **Tagging** - `git tag`
11. **Rebasing** - `git rebase`
12. **Cherry-picking** - `git cherry-pick`
13. **Resetting** - `git reset`
14. **Reverting** - `git revert`
15. **And many more...**

---

## 🎮 How to Use

1. **Sign Up/Login** - Create an account or continue as guest
2. **Browse Curriculum** - View all available lessons
3. **Start Learning** - Click on a lesson to begin
4. **Read the Guide** - Follow the step-by-step instructions
5. **Run Commands** - Type Git commands in the terminal
6. **Visualize** - Watch the Git canvas update in real-time
7. **Complete** - Finish the lesson to unlock the next one

### Free Play Sandbox
- Access unlimited practice mode
- Experiment with any Git commands
- No lesson restrictions
- Perfect for testing and learning

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Vercel will auto-detect the configuration
4. Deploy with one click!

The `vercel.json` is already configured for optimal deployment.

### Netlify

The project also includes `netlify.toml` for Netlify deployment.

---

## 📁 Project Structure

```
gitjourney/
├── components/          # React components
│   ├── ColorBends.tsx   # Animated 3D background
│   ├── CurriculumView.tsx
│   ├── FeatureGuide.tsx
│   ├── GitCanvas.tsx   # Git visualization
│   ├── GuidePanel.tsx
│   ├── LandingPage.tsx
│   └── ...
├── utils/              # Utility functions
│   ├── auth.ts        # Authentication logic
│   ├── gitLogic.ts    # Git simulation engine
│   └── lessonGuides.ts
├── types.ts           # TypeScript type definitions
├── App.tsx           # Main application component
├── index.tsx         # Entry point
├── vite.config.ts    # Vite configuration
└── vercel.json       # Vercel deployment config
```

---

## 🎨 Customization

### Themes
- Toggle between dark and light mode
- Preferences saved in localStorage

### Colors
- Customize color scheme in `tailwind.config.js`
- Adjust ColorBends animation colors in `components/ColorBends.tsx`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- 3D Graphics powered by [Three.js](https://threejs.org/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📧 Contact

**Praveen** - [GitHub](https://github.com/Praveen-afkl)

Project Link: [https://github.com/Praveen-afkl/GitJourney---Interactive-Git-learning-platform](https://github.com/Praveen-afkl/GitJourney---Interactive-Git-learning-platform)

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ for the developer community

</div>
