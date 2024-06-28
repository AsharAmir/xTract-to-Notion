console.log("popup script injected");

document.addEventListener('DOMContentLoaded', function() {
  // Fetch summary from local storage when popup is opened
  chrome.storage.local.get('summary', function(data) {
    console.log("Showing summary");
    console.log(data.summary);
    displaySummary(data.summary);
  });

  function displaySummary(summaryText) {
    const summaryElement = document.getElementById('summary');
    if (summaryElement) {
      const html = renderNotionFormat(summaryText);
      console.log(html);
      summaryElement.innerHTML = html;
    } else {
      console.error('Summary element not found in popup HTML.');
    }
  }

  // Function to render notion format text to HTML
  function renderNotionFormat(text) {
    // Convert markdown-like text to HTML using marked.js
    return marked(text);
  }
});
