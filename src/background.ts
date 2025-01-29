// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('ForceGuide extension installed');
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStorageData') {
      chrome.storage.local.get([request.key], (result) => {
        sendResponse(result);
      });
      return true; // Indicates async response
    }
  });
  
  // Update content script when URL changes
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('codeforces.com')) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['contentScript.js']
      }).catch(err => console.log('Error injecting content script:', err));
    }
  }); 