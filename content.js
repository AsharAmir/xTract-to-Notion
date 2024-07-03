console.log("content script injected");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showSummary') {
    chrome.storage.local.set({ summary: message.summary }, () => {
      console.log('Summary saved locally');
      chrome.runtime.sendMessage({ action: 'showPopup' });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'parseHTML') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(request.html, 'text/html');
    sendResponse({ text: doc.body.textContent || "" });
  }
});

let pendingNotificationElement = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
    if (pendingNotificationElement) {
      pendingNotificationElement.remove();
      pendingNotificationElement = null;
    }

    const notificationElement = document.createElement('div');
    notificationElement.style.position = 'fixed';
    notificationElement.style.top = '10px';
    notificationElement.style.right = '10px';
    notificationElement.style.background = '#3c4043';
    notificationElement.style.border = '1px solid #5f6368';
    notificationElement.style.padding = '20px';
    notificationElement.style.borderRadius = '5px';
    notificationElement.style.zIndex = '9999';
    notificationElement.style.color = '#ffffff';
    notificationElement.style.fontFamily = 'Arial, sans-serif';
    notificationElement.textContent = `Summary Generated, check the summary extension to view!`;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 2500); //remove after 2,5s
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showPendingNotification') {
    if (pendingNotificationElement) {
      pendingNotificationElement.remove();
    }

    pendingNotificationElement = document.createElement('div');
    pendingNotificationElement.style.position = 'fixed';
    pendingNotificationElement.style.top = '5px';
    pendingNotificationElement.style.right = '10px';
    pendingNotificationElement.style.background = '#3c4043';
    pendingNotificationElement.style.border = '1px solid #5f6368';
    pendingNotificationElement.style.padding = '20px';
    pendingNotificationElement.style.borderRadius = '5px';
    pendingNotificationElement.style.zIndex = '9999';
    pendingNotificationElement.style.color = '#ffffff';
    pendingNotificationElement.style.fontFamily = 'Arial, sans-serif';
    pendingNotificationElement.textContent = `Summary is being generated. Please wait!`;

    const loadingCircleElement = document.createElement('div');
    loadingCircleElement.style.border = '4px solid #f3f3f3';
    loadingCircleElement.style.borderRadius = '50%';
    loadingCircleElement.style.borderTop = '4px solid #3498db';
    loadingCircleElement.style.width = '20px';
    loadingCircleElement.style.height = '20px';
    loadingCircleElement.style.animation = 'spin 2s linear infinite';
    loadingCircleElement.style.display = 'inline-block';
    loadingCircleElement.style.marginLeft = '10px';
    loadingCircleElement.style.marginTop = '5px';
    pendingNotificationElement.appendChild(loadingCircleElement);

    document.body.appendChild(pendingNotificationElement);
  }
});

// CSS for the spinning animation
const styleElement = document.createElement('style');
styleElement.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleElement);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'notionGenerated') {
    const notificationElement = document.createElement('div');
    notificationElement.style.position = 'fixed';
    notificationElement.style.top = '10px';
    notificationElement.style.right = '10px';
    notificationElement.style.background = '#3c4043';
    notificationElement.style.border = '1px solid #5f6368';
    notificationElement.style.padding = '20px';
    notificationElement.style.borderRadius = '5px';
    notificationElement.style.zIndex = '9999';
    notificationElement.style.color = '#ffffff';
    notificationElement.style.fontFamily = 'Arial, sans-serif';
    notificationElement.textContent = "Summary exported to notion";

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 3000); // Remove after 3 secs
  }
});