chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "onboarding.html" });
  }
  console.log('Job Radar AI extension successfully installed.');
});
