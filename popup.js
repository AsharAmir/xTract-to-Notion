console.log("popup script injected");

document.addEventListener('DOMContentLoaded', function() {
  // Fetch summary from local storage when popup is opened
  chrome.storage.local.get('summary', function(data) {
    console.log("showing summary");
    console.log(data.summary);
    displaySummary(data.summary);
  });

  function displaySummary(summaryText) {
    const summaryElement = document.getElementById('summary');
    if (summaryElement) {
      summaryElement.innerHTML = renderToHTML(summaryText);
    } else {
      console.error('Summary element not found in popup HTML.');
    }
  }

  function renderToHTML(text) {
    const lines = text.split('\n');
    let html = '';
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        html += `<h2>${line.substring(3)}</h2>`;
      } else if (line.startsWith('* ')) {
        html += `<ul><li>${line.substring(2)}</li></ul>`;
      } else if (line.startsWith('**')) {
        html += `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`;
      } else if (line.startsWith('** ')) {
        html += `<p><strong>${line.substring(3)}</strong></p>`;
      } else if (line.startsWith('**Example:** ')) {
        html += `<p><strong>Example:</strong> ${line.substring(12)}</p>`;
      } else if (line.startsWith('**Pros:**')) {
        html += `<h3>Pros:</h3>`;
      } else if (line.startsWith('**Cons:**')) {
        html += `<h3>Cons:</h3>`;
      } else {
        html += `<p>${line}</p>`;
      }
    });
    return html;
  }
});
