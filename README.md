# Chunked Scheduler Gantt Art

An interactive React + TypeScript web application that generates and visualizes chunked job schedules using Gantt charts.

## 🚀 Features
- Visual Gantt chart rendering
- Custom job input forms
- Real-time results table
- Clean UI using Tailwind + ShadCN

## 🛠️ Installation

```bash
git clone https://github.com/<username>/chunked-scheduler-gantt-art-main.git
cd chunked-scheduler-gantt-art-main
npm install
npm run dev
```

## 🌐 Deploy to GitHub Pages

1. Add this to your `vite.config.ts`:
   ```ts
   base: "/chunked-scheduler-gantt-art-main/"
   ```

2. Install `gh-pages`:

   ```bash
   npm install gh-pages --save-dev
   ```

3. Add this to `package.json`:

   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

4. Run the build and deploy:

   ```bash
   npm run build
   npm run deploy
   ```

The app will be live at:  
**https://<username>.github.io/chunked-scheduler-gantt-art-main**

## 📁 Folder Structure
- `src/components`: UI components
- `src/pages`: Page routes
- `src/utils`: Scheduling logic

---

🖼️ Powered by React + Vite + Tailwind + ShadCN
