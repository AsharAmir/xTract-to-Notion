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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
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
    }, 4000); // Remove after 4 seconds
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showPendingNotification') {
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
    notificationElement.textContent = `Summary is being generated. Please wait!`;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 4000); // Remove after 4 seconds
  }
});
