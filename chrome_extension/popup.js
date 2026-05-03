document.getElementById('analyzeBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerText = "Analyzing page...";

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            if (typeof injectFloatingWidget === 'function') {
                injectFloatingWidget();
                return true;
            }
            return false;
        },
    }, (injectionResults) => {
        if (!injectionResults || !injectionResults[0]) {
            resultDiv.innerText = "Failed to communicate with page.";
            return;
        }
        
        if (injectionResults[0].result) {
            resultDiv.innerText = "Dashboard opened on the page!";
            setTimeout(() => window.close(), 1500);
        } else {
            resultDiv.innerText = "Content script not ready. Reload page.";
        }
    });
});
