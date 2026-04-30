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
    widget.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 20px;
            width: 300px;
            z-index: 2147483647; /* Max z-index to stay on top */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border: 1px solid #e5e7eb;
        ">
            <button id="job-radar-close-btn" style="
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 14px;
                cursor: pointer;
                color: #9ca3af;
                padding: 0;
            ">✖</button>
            
            <h3 style="margin-top: 0; color: #111827; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">✨</span> Job Radar AI
            </h3>
            
            <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px; line-height: 1.4;">
                Job Description detected! Would you like to analyze how well your resume matches this role?
            </p>
            
            <button id="job-radar-analyze-btn" style="
                width: 100%;
                padding: 10px;
                background-color: #2563eb;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: background-color 0.2s;
            ">Analyze Resume Match</button>
            
            <div id="job-radar-status" style="
                margin-top: 12px; 
                font-size: 12px; 
                color: #059669; 
                display: none;
                background: #d1fae5;
                padding: 8px;
                border-radius: 4px;
                text-align: center;
            "></div>
        </div>
    `;

    document.body.appendChild(widget);

    // Close button logic
    document.getElementById("job-radar-close-btn").addEventListener("click", () => {
        widget.remove();
    });

    // Analyze button logic
    const analyzeBtn = document.getElementById("job-radar-analyze-btn");
    analyzeBtn.addEventListener("mouseover", () => { analyzeBtn.style.backgroundColor = "#1d4ed8"; });
    analyzeBtn.addEventListener("mouseout", () => { analyzeBtn.style.backgroundColor = "#2563eb"; });
    
    analyzeBtn.addEventListener("click", () => {
        const statusDiv = document.getElementById("job-radar-status");
        statusDiv.style.display = "block";
        statusDiv.innerText = "Extracting JD text...";
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = "0.7";
        
        // Extract page text
        const pageText = document.body.innerText;
        console.log("Job Radar Extracted Text:", pageText.substring(0, 300) + "...");
        
        // Simulate sending to backend
        setTimeout(() => {
            statusDiv.innerText = "Connecting to Python Backend...";
        }, 1000);
    });
}

// Wait for the page to load, then run detection
// Using a timeout because single-page apps (like React/Angular used by Naukri) might take a second to render the text
window.addEventListener("load", () => {
    setTimeout(detectJDAndShowWidget, 2000);
});
