# 🚀 Job Radar AI - Resume Analyzer

Welcome to **Job Radar AI**! This project is a smart Chrome extension paired with an AI-powered local backend. It automatically detects job descriptions on websites (like LinkedIn, Indeed, or company pages) and compares them to your resume. 

Instead of just giving you a random score, it tells you *exactly* which skills match, what you are missing, and gives you a beautiful analytics dashboard to help you land your dream job!

---

## ✨ What does it do?
- **Auto-Detects Jobs:** Recognizes when you are looking at a job posting and pops up automatically.
- **Evidence-Based Matching:** Uses AI to read your resume and the job description, proving *why* you are a match.
- **Beautiful Analytics:** Shows your fit using visual charts, match distributions, and clear gap analysis (Critical, Moderate, and Minor gaps).
- **Private & Local:** Your resume is processed locally by your own running backend before talking to the AI.

---

## 🛠️ Technologies Used
We built this to be fast, lightweight, and modern:
- **Backend API:** [FastAPI](https://fastapi.tiangolo.com/) & Uvicorn (for lightning-fast Python serving)
- **AI Engine:** Llama-3 (via [Groq](https://groq.com/) for instant responses)
- **AI Framework:** [Langchain](https://www.langchain.com/) & Pydantic (for strictly structured JSON outputs)
- **Embeddings:** `sentence-transformers` (to semantically match similar skills)
- **PDF Extraction:** `PyPDF2` (to read your uploaded resume)
- **Chrome Extension:** Pure Vanilla HTML, CSS (Glassmorphism design), and JavaScript
- **Visuals:** [Chart.js](https://www.chartjs.org/) (loaded via CDN)

---

## 📖 How to Run Locally

It's super easy to get started! You need to run the Python backend and load the extension into Google Chrome.

### Step 1: Start the Backend
1. Make sure you have Python installed on your computer.
2. Open your terminal or command prompt in this project folder.
3. Install the required Python packages by running:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend API server:
   ```bash
   python api.py
   ```
   *You should see a message saying the server is running on `http://127.0.0.1:8000`.*

### Step 2: Load the Chrome Extension
1. Open Google Chrome and type `chrome://extensions/` in the URL bar.
2. Turn on **Developer mode** (the switch is in the top right corner).
3. Click the **Load unpacked** button in the top left.
4. Select the `chrome_extension` folder from this project.
5. The Job Radar AI icon will appear in your Chrome toolbar!

### Step 3: Set Up and Use!
1. Click the Job Radar AI extension icon in your browser toolbar.
2. Complete the onboarding: paste your **Groq API Key** and upload your **Resume Text**.
3. Go to any job board (like a LinkedIn job post).
4. The Job Radar widget will appear on the screen! Click **"Analyze Resume Match"** to see your results. 
5. Click **"View Advanced Analytics"** to see your charts and gap analysis.

---

## 📂 Folder Structure
We keep things clean and minimal:
- `/api.py` — The main brain that routes requests.
- `/agents/` — Contains the AI reasoning logic and text parsers.
- `/chrome_extension/` — All the visual UI, scripts, and popup code for Chrome.
- `/utils/` — Shared helpers for AI connections and text cleaning.

Enjoy upgrading your job hunt! 🎯
