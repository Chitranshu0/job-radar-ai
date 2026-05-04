document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(['fullData'], (result) => {
        if (!result.fullData) {
            document.getElementById('summary-text').innerText = "No analytics data found. Please run an analysis first.";
            return;
        }
        
        const data = result.fullData;
        const analytics = data.analytics || {};
        const gaps = data.gap_analysis || { critical: [], moderate: [], minor: [] };
        
        // Populate text fields
        document.getElementById('overall-score').innerText = (data.score || data.overall_match_score || 0) + "%";
        document.getElementById('fit-category').innerText = data.fit_category || "Unknown Fit";
        document.getElementById('shortlist-potential').innerText = "Potential: " + (data.shortlist_potential || "N/A");
        document.getElementById('summary-text').innerText = data.summary || data.executive_summary || "No summary available.";
        
        // Populate Improvement Actions
        const impContainer = document.getElementById('improvement-actions');
        const actions = data.recommended_actions || [];
        if (actions.length === 0) impContainer.innerHTML = "<li>You're all set! No major improvements needed for this JD.</li>";
        else {
            actions.forEach(a => {
                const li = document.createElement('li');
                li.innerText = a;
                impContainer.appendChild(li);
            });
        }
        
        // Populate Evidence Mapping Table
        const mappingTable = document.getElementById('mapping-table-body');
        const mapping = data.requirement_mapping || [];
        if (mapping.length > 0) {
            mappingTable.innerHTML = "";
            mapping.forEach(req => {
                const tr = document.createElement('tr');
                
                let impClass = 'optional';
                if ((req.importance || '').toLowerCase().includes('core')) impClass = 'core';
                else if ((req.importance || '').toLowerCase().includes('secondary')) impClass = 'secondary';
                
                let statClass = 'miss';
                if ((req.status || '').toLowerCase().includes('strong') || (req.status || '').toLowerCase().includes('full')) statClass = 'full';
                else if ((req.status || '').toLowerCase().includes('partial')) statClass = 'partial';
                
                tr.innerHTML = `
                    <td style="font-weight: 500;">${req.requirement || 'Unknown'}</td>
                    <td><span class="tag ${impClass}">${req.importance || 'Optional'}</span></td>
                    <td class="status ${statClass}">${req.status || 'No Data'}</td>
                    <td style="font-size: 13px;">${req.evidence || 'No mapping data available'}</td>
                `;
                mappingTable.appendChild(tr);
            });
        } else {
            mappingTable.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No mapping data available.</td></tr>";
            // Fallback alert as requested
            console.log("No mapping data available");
        }
        
        // Populate Gaps
        const critContainer = document.getElementById('critical-gaps');
        if (!gaps.critical || gaps.critical.length === 0) critContainer.innerHTML = "<span class='pill match'>None!</span>";
        else {
            gaps.critical.forEach(s => {
                const el = document.createElement('span');
                el.className = 'pill miss';
                el.innerText = s;
                critContainer.appendChild(el);
            });
        }
        
        const modContainer = document.getElementById('moderate-gaps');
        const allMod = [...(gaps.moderate || []), ...(gaps.minor || [])];
        if (allMod.length === 0) modContainer.innerHTML = "<span class='pill match'>None</span>";
        else {
            allMod.forEach(s => {
                const el = document.createElement('span');
                el.className = 'pill warn';
                el.innerText = s;
                modContainer.appendChild(el);
            });
        }
        
        // Charts Setup
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
        
        // 1. Requirement Coverage (Polar Area or Bar)
        const ctxCov = document.getElementById('coverageChart').getContext('2d');
        const reqCov = analytics.requirement_coverage || { "Core": 80, "Secondary": 60, "Optional": 40 };
        
        new Chart(ctxCov, {
            type: 'bar',
            data: {
                labels: Object.keys(reqCov),
                datasets: [{
                    label: 'Coverage %',
                    data: Object.values(reqCov),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(100, 116, 139, 0.8)'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
        
        // 2. Match Distribution Chart (Doughnut)
        const ctxDist = document.getElementById('matchDistChart').getContext('2d');
        const matchDistObj = data.match_distribution || {"core": 0, "secondary": 0, "optional": 0};
        
        new Chart(ctxDist, {
            type: 'doughnut',
            data: {
                labels: ['Core', 'Secondary', 'Optional'],
                datasets: [{
                    data: [matchDistObj.core || 0, matchDistObj.secondary || 0, matchDistObj.optional || 0],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(100, 116, 139, 0.7)'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                },
                cutout: '70%'
            }
        });
    });
});
