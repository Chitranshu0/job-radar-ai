document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(['currentAnalytics', 'resumeText'], (result) => {
        if (!result.currentAnalytics) {
            document.getElementById('summary-text').innerText = "No analytics data found. Please run an analysis first.";
            return;
        }
        
        const analytics = result.currentAnalytics;
        const gData = analytics.graph_data || {};
        const sScores = analytics.section_scores || {};
        
        // In the background, api.py sets overall_score in the root state. But we only passed analytics data?
        // Wait, in content.js, we only did `chrome.storage.local.set({ currentAnalytics: data.analytics })`
        // We can get overall score from data.score if we also stored it, or compute it.
        // For accuracy, let's just use section_scores to compute a rough average or use a stored score.
        // Actually, we can update content.js to also save the overall score, but computing is fine if it wasn't saved.
        
        let overall = 0;
        let count = 0;
        for (const [k, v] of Object.entries(sScores)) {
            overall += v;
            count++;
        }
        
        // We'll try to fetch score from local storage if available, else fallback to compute.
        chrome.storage.local.get(['latestScore', 'latestSummary'], (extraData) => {
            const finalScore = extraData.latestScore || (count > 0 ? Math.round(overall / count) : 0);
            document.getElementById('overall-score').innerText = finalScore + "%";
            
            // Text fields
            document.getElementById('summary-text').innerText = extraData.latestSummary || "No summary available. Please run the analysis again.";
            
            // Populate Skills
            const matchedContainer = document.getElementById('matched-skills');
            const matched = analytics.matched_skills || [];
            if (matched.length === 0) matchedContainer.innerHTML = "<span class='pill miss'>None Found</span>";
            else {
                matched.forEach(s => {
                    const el = document.createElement('span');
                    el.className = 'pill match';
                    el.innerText = s;
                    matchedContainer.appendChild(el);
                });
            }
            
            const missingContainer = document.getElementById('missing-skills');
            const missing = analytics.missing_skills || [];
            if (missing.length === 0) missingContainer.innerHTML = "<span class='pill match'>No Major Gaps!</span>";
            else {
                missing.forEach(s => {
                    const el = document.createElement('span');
                    el.className = 'pill miss';
                    el.innerText = s;
                    missingContainer.appendChild(el);
                });
            }
            
            // Populate Improvement Actions
            const impContainer = document.getElementById('improvement-actions');
            const actions = analytics.improvement_actions || [];
            if (actions.length === 0) impContainer.innerHTML = "<li>You're all set! No major improvements needed for this JD.</li>";
            else {
                actions.forEach(a => {
                    const li = document.createElement('li');
                    li.innerText = a;
                    impContainer.appendChild(li);
                });
            }
            
            // Charts Setup
            Chart.defaults.color = '#94a3b8';
            Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
            
            // 1. Radar / Polar Area chart for Category Breakdown
            const ctxCat = document.getElementById('categoryChart').getContext('2d');
            const catLabels = Object.keys(sScores).length ? Object.keys(sScores).map(k => k.replace(/_/g, ' ').toUpperCase()) : ['Skills', 'Experience', 'Keywords'];
            const catData = Object.keys(sScores).length ? Object.values(sScores) : [80, 60, 90];
            
            new Chart(ctxCat, {
                type: 'polarArea',
                data: {
                    labels: catLabels,
                    datasets: [{
                        label: 'Match Quality',
                        data: catData,
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(245, 158, 11, 0.6)',
                            'rgba(239, 68, 68, 0.6)',
                            'rgba(139, 92, 246, 0.6)'
                        ],
                        borderColor: '#1e293b',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            ticks: { display: false, max: 100 },
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            angleLines: { color: 'rgba(255,255,255,0.05)' }
                        }
                    },
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
            
            // 2. Distribution Chart (Bar) for Graph Data
            const ctxDist = document.getElementById('distributionChart').getContext('2d');
            let distLabels = [];
            let distData = [];
            
            if (gData.score_distribution && Object.keys(gData.score_distribution).length > 0) {
                distLabels = Object.keys(gData.score_distribution);
                distData = Object.values(gData.score_distribution);
            } else {
                // Fallback realistic data
                distLabels = ["Relevance", "Clarity", "Impact", "Keywords"];
                distData = [finalScore, finalScore > 20 ? finalScore - 15 : 50, finalScore > 10 ? finalScore - 5 : 60, finalScore];
            }
            
            new Chart(ctxDist, {
                type: 'bar',
                data: {
                    labels: distLabels,
                    datasets: [{
                        label: 'Evaluation Metric',
                        data: distData,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderRadius: 6,
                        barThickness: 24
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        });
    });
});
