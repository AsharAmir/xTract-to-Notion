chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');

  // Create context menu item
  chrome.contextMenus.create({
    id: 'summarizeText',
    title: 'Generate Summary',
    contexts: ['selection']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Context menu creation error:', chrome.runtime.lastError);
    } else {
      console.log('Context menu item created.');
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu item clicked.');
  chrome.tabs.sendMessage(tab.id, { action: 'showPendingNotification' });
  if (info.menuItemId === 'summarizeText') {
    let selectedText = info.selectionText.trim();
    if (selectedText.length > 0) {
      console.log('Selected text:', selectedText);
      chrome.tabs.sendMessage(tab.id, { action: 'parseHTML', html: selectedText }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error parsing HTML:', chrome.runtime.lastError);
        } else {
          selectedText = response.text;
          fetchSummary(selectedText, tab.id);
        }
      });
    } else {
      console.error('No text selected.');
    }
  }
});

function fetchSummary(inputText, tabId) {
  // const apiUrl = 'http://localhost:5555/summarize';
  const apiUrl = 'https://xtract-smmry-e9715027adfc.herokuapp.com/summarize';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input_text: inputText })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Summary received:', data.summary);
    chrome.tabs.sendMessage(tabId, { action: 'showSummary', summary: data.summary }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
      } else {
        console.log('Message sent to content script:', response);
      }
      chrome.tabs.sendMessage(tabId, { action: 'showNotification', summary: data.summary });
    }
    );
  })
  .catch(error => {
    console.error('Error fetching summary:', error);
  });
}

function openSummaryPopUp(summary){
  console.log("Opening popup window");
  const popupUrl = chrome.runtime.getURL('popup.html');
  chrome.windows.create({
    url: `${popupUrl}?summary=${encodeURIComponent(summary)}`,
    type: 'popup',
    width: 400,
    height: 300
  }, (window) => {
    console.log('Popup window created:', window);
  });
}