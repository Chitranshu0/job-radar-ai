function detectJDAndShowWidget() {
    // 1. Fast check for known Job URLs (Instant Detection)
    const url = window.location.href.toLowerCase();
    const isKnownJobBoard = 
        url.includes("naukri.com/job-listings") || 
        url.includes("linkedin.com/jobs/view") || 
        url.includes("indeed.com/viewjob") || 
        url.includes("glassdoor.com/job-listing") ||
        url.includes("greenhouse.io") ||
        url.includes("lever.co") ||
        url.includes("workday.com") ||
        url.includes("/careers/") || 
        url.includes("/jobs/");

    if (isKnownJobBoard) {
        return injectFloatingWidget();
    }

    // 2. Smarter Pure JS Logic Computation (Semantic parsing)
    let score = 0;
    const pageText = document.body.innerText.toLowerCase();

    // A. Detect "Apply" buttons/actions (Highest Confidence)
    const applyPhrases = [
        "apply on employer site", "easy apply", "apply now", 
        "submit your application", "apply for this job", "apply for this position"
    ];
    for (const phrase of applyPhrases) {
        if (pageText.includes(phrase)) score += 5; 
    }

    // B. Detect JD Section Headers (High Confidence)
    const sectionHeaders = [
        "primary responsibilities", "key responsibilities", "role & responsibilities",
        "required qualifications", "minimum qualifications", "preferred qualifications", 
        "what you'll do", "what you will do", "who you are", "about the role",
        "your qualifications for this job", "what we're looking for"
    ];
    let foundSections = 0;
    for (const header of sectionHeaders) {
        if (pageText.includes(header)) foundSections++;
    }
    score += (foundSections * 3); // 3 points per standard JD section

    // C. Detect Employment Metadata (Medium Confidence)
    const metadataTerms = [
        "full-time", "part-time", "contract", "remote", "hybrid", "on-site", 
        "years of experience", "bachelor's degree", "master's degree", "equal opportunity employer"
    ];
    for (const term of metadataTerms) {
        if (pageText.includes(term)) score += 1;
    }

    // D. Detect Company Profile Info (Low Confidence, but supports the thesis)
    const companyInfo = ["company overview", "industry", "company size", "employees", "headquarters"];
    let compCount = 0;
    for (const info of companyInfo) {
        if (pageText.includes(info)) compCount++;
    }
    if (compCount >= 2) score += 2;

    // E. Page Length Sanity Check
    const wordCount = pageText.split(/\\s+/).length;
    if (wordCount > 100 && wordCount < 5000) {
        score += 1;
    } else {
        score -= 15; // Strongly penalize tiny pages or massive wikis
    }

    // If score >= 8, we confidently pop the widget!
    if (score >= 8) {
        console.log("Job Radar AI: Confirmed JD locally! Score: " + score);
        injectFloatingWidget();
    } else {
        console.log("Job Radar AI: Not enough JD evidence. Score: " + score);
    }
}

function injectFloatingWidget() {
    // Prevent duplicate injections
    if (document.getElementById("job-radar-floating-widget")) return;

    const widget = document.createElement("div");
    widget.id = "job-radar-floating-widget";
    // Premium Dark Mode Glassmorphism Style
    widget.innerHTML = `
        <div id="job-radar-container" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(17, 24, 39, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
            padding: 24px;
            width: 340px;
            z-index: 2147483647;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #f3f4f6;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        ">
            <button id="job-radar-close-btn" style="
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                color: #9ca3af;
                padding: 4px;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s, color 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#fff';" onmouseout="this.style.background='none'; this.style.color='#9ca3af';">✖</button>
            
            <div id="job-radar-initial-view">
                <h3 style="margin: 0 0 8px 0; color: #fff; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 22px; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));">✨</span> Job Radar AI
                </h3>
                
                <p style="font-size: 14px; color: #d1d5db; margin-bottom: 20px; line-height: 1.5;">
                    Job Description detected! Want to see how well your resume matches this role?
                </p>
                
                <button id="job-radar-analyze-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #2563eb, #4f46e5);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(37, 99, 235, 0.6)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 14px rgba(37, 99, 235, 0.4)';">Analyze Resume Match</button>
                
                <div id="job-radar-status" style="
                    margin-top: 16px; 
                    font-size: 13px; 
                    color: #60a5fa; 
                    display: none;
                    text-align: center;
                    font-weight: 500;
                "></div>
            </div>

            <div id="job-radar-result-view" style="display: none; text-align: center;">
                <h3 style="margin: 0 0 16px 0; color: #fff; font-size: 16px; font-weight: 600;">Match Score</h3>
                <div style="position: relative; width: 160px; height: 80px; margin: 0 auto 20px; overflow: hidden;">
                    <!-- Background arc -->
                    <svg viewBox="0 0 200 100" style="width: 100%; height: 100%;">
                        <path d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="15" stroke-linecap="round" />
                        <!-- Foreground arc (animated) -->
                        <path id="job-radar-speedometer" d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="url(#gradient)" stroke-width="15" stroke-linecap="round" stroke-dasharray="250" stroke-dashoffset="250" style="transition: stroke-dashoffset 1.5s ease-out;" />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#ef4444" />
                                <stop offset="50%" stop-color="#f59e0b" />
                                <stop offset="100%" stop-color="#10b981" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; text-align: center;">
                        <span id="job-radar-score-text" style="font-size: 32px; font-weight: 700; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">0</span><span style="font-size: 16px; color: #9ca3af;">%</span>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; text-align: left; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 12px;">
                    <p id="job-radar-summary" style="font-size: 13px; color: #d1d5db; margin: 0; line-height: 1.5;"></p>
                </div>
                
                <button id="job-radar-view-analytics-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.5);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(59, 130, 246, 0.1)';" onmouseout="this.style.background='transparent';">View Advanced Analytics</button>
            </div>
        </div>
    `;

    document.body.appendChild(widget);

    // Close button logic
    document.getElementById("job-radar-close-btn").addEventListener("click", () => {
        widget.remove();
    });

    // Analyze button logic
    const analyzeBtn = document.getElementById("job-radar-analyze-btn");
    
    analyzeBtn.addEventListener("click", async () => {
        const statusDiv = document.getElementById("job-radar-status");
        statusDiv.style.display = "block";
        statusDiv.innerText = "Extracting JD text...";
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = "0.7";
        
        // Extract page text
        const pageText = document.body.innerText;
        
        statusDiv.innerText = "Connecting to AI Backend...";
        
        try {
            const storageData = await chrome.storage.local.get(['resumeText', 'apiKey']);
            if (!storageData.resumeText || !storageData.apiKey) {
                throw new Error("Setup incomplete. Please click the extension icon to set up your profile.");
            }

            const response = await fetch("http://127.0.0.1:8000/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    jd_text: pageText,
                    resume_text: storageData.resumeText,
                    api_key: storageData.apiKey
                })
            });
            
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Backend not reachable");
            }
            
            const data = await response.json();
            
            // Switch view
            document.getElementById("job-radar-initial-view").style.display = "none";
            document.getElementById("job-radar-result-view").style.display = "block";
            
            // Animate speedometer
            setTimeout(() => {
                const score = data.score;
                
                // Count up animation for score text
                let currentScore = 0;
                const scoreInterval = setInterval(() => {
                    if (currentScore >= score) {
                        clearInterval(scoreInterval);
                        document.getElementById("job-radar-score-text").innerText = score;
                    } else {
                        currentScore += 2;
                        if (currentScore > score) currentScore = score;
                        document.getElementById("job-radar-score-text").innerText = currentScore;
                    }
                }, 20);
                
                // Stroke offset animation
                // The arc length for 160 units (180 to 20, r=70) is roughly 220
                // stroke-dasharray is 250. Full arc is offset 250 - 220 = 30.
                const offset = 250 - (score / 100) * 220; 
                document.getElementById("job-radar-speedometer").style.strokeDashoffset = offset;
                document.getElementById("job-radar-summary").innerText = data.summary;
                
                // Store analytics and setup button
                if (data.analytics) {
                    chrome.storage.local.set({ 
                        currentAnalytics: data.analytics,
                        latestScore: data.score,
                        latestSummary: data.summary
                    });
                    document.getElementById("job-radar-view-analytics-btn").addEventListener("click", () => {
                        chrome.runtime.sendMessage({ action: "openAnalytics" });
                    });
                } else {
                    document.getElementById("job-radar-view-analytics-btn").style.display = "none";
                }
            }, 100);
            
        } catch (e) {
            statusDiv.innerText = e.message;
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = "1";
        }
    });
}

// Wait for the page to load, then run detection
// Using a timeout because single-page apps (like React/Angular used by Naukri) might take a second to render the text
window.addEventListener("load", () => {
    setTimeout(detectJDAndShowWidget, 2000);
});
