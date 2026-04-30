document.getElementById('analyzeBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerText = "Analyzing page content...";

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageText,
    }, (injectionResults) => {
        if (!injectionResults || !injectionResults[0]) {
            resultDiv.innerText = "Failed to extract text from page.";
            return;
        }
        
        const pageText = injectionResults[0].result;
        
        // TODO: Send 'pageText' to your Python FastAPI/Flask backend
        // For example:
        // fetch('http://127.0.0.1:8000/analyze', { ... })
        
        resultDiv.innerText = "Text extracted! Ready to send to Python backend for JD Classification.";
        console.log("Extracted text (first 200 chars):", pageText.substring(0, 200) + "...");
    });
});

// This function gets executed in the context of the active webpage
function extractPageText() {
    return document.body.innerText;
}
