console.log("content script injected");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showSummary') {
    chrome.storage.local.set({ summary: message.summary }, () => {
      console.log('Summary saved locally');
      chrome.runtime.sendMessage({ action: 'showPopup' });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
    const notificationElement = document.createElement('div');
    notificationElement.style.position = 'fixed';
    notificationElement.style.top = '10px';
    notificationElement.style.right = '10px';
    notificationElement.style.background = '#8c8888';
    notificationElement.style.border = '1px solid #cccccc';
    notificationElement.style.padding = '10px';
    notificationElement.style.zIndex = '9999';
    notificationElement.textContent = `Summary Generated, check the summary extension to view!`;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 4000); // Remove after 4 seconds
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showPendingNotification') {
    const notificationElement = document.createElement('div');
    notificationElement.style.position = 'fixed';
    notificationElement.style.top = '10px';
    notificationElement.style.right = '10px';
    notificationElement.style.background = '#8c8888';
    notificationElement.style.border = '1px solid #cccccc';
    notificationElement.style.padding = '10px';
    notificationElement.style.zIndex = '9999';
    notificationElement.textContent = `Summary is being generated. Please wait!`;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 4000); // Remove after 4 seconds
  }
});
