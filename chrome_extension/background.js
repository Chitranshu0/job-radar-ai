chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "onboarding.html" });
  }
  console.log('Job Radar AI extension successfully installed.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openAnalytics") {
        chrome.tabs.create({ url: "analytics.html" });
    }
});
