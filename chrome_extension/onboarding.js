document.getElementById('saveBtn').addEventListener('click', async () => {
    const resumeFile = document.getElementById('resumeFile').files[0];
    const coverLetterFile = document.getElementById('coverLetterFile').files[0];
    const apiKey = document.getElementById('apiKey').value;
    const statusDiv = document.getElementById('status');

    if (!resumeFile || !apiKey) {
        alert("Please upload a resume and provide an API key.");
        return;
    }

    const btn = document.getElementById('saveBtn');
    btn.innerText = "Parsing Resume via Backend...";
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append("file", resumeFile);
        
        // Call backend to parse PDF
        const response = await fetch("http://127.0.0.1:8000/api/parse-resume", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Backend parsing failed. Make sure the backend is running on port 8000.");
        const data = await response.json();
        const resumeText = data.text;

        chrome.storage.local.set({
            resumeText: resumeText,
            apiKey: apiKey
        }, () => {
            statusDiv.style.display = 'block';
            btn.innerText = "Done";
        });
    } catch (e) {
        alert("Error: " + e.message);
        btn.innerText = "Save & Initialize";
        btn.disabled = false;
    }
});
