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

  document.getElementById("export_notion").addEventListener("click", function() {
    console.log("Exporting summary to Notion");
    chrome.storage.local.get('summary', function(data) {
      exportToNotion(data.summary);
    });
  });

  async function exportToNotion(summaryText) {
    const notionApiUrl = 'https://api.notion.com/v1/pages';
    const notionApiKey = 'secret_cntp5rPMTRHnlzDBFzWBdM3yfn2xLAafHGL0rD23q70'; // Replace with your actual Notion API key
    const parentPageId = '30f761aa28b548dbba16996579436fa4'; // Replace with your actual parent page ID

    // Split summaryText into chunks of <= 2000 characters
    const chunkedText = splitTextIntoChunks(summaryText, 2000);

    // Prepare an array to hold all children blocks
    const childrenBlocks = [];

    // Iterate over each chunk of text and create blocks with text styling
    chunkedText.forEach(chunk => {
        const blocks = formatTextBlocks(chunk);
        childrenBlocks.push(...blocks);
    });

    const response = await fetch(notionApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${notionApiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
            parent: { page_id: parentPageId },
            properties: {
                title: {
                    title: [
                        {
                            text: {
                                content: 'Summary'
                            }
                        }
                    ]
                }
            },
            children: childrenBlocks // Send all children blocks
        })
    });

    if (response.ok) {
        alert('Summary exported to Notion!');
    } else {
        const errorText = await response.text();
        console.error('Error exporting to Notion:', response.statusText, errorText);
        alert('Failed to export summary to Notion: ' + response.statusText);
    }
}

// Function to split text into chunks of specified length
function splitTextIntoChunks(text, maxLength) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxLength;
        if (end < text.length) {
            end = text.lastIndexOf('\n', end);
            if (end === -1) end = text.length;
        }
        chunks.push(text.substring(start, end));
        start = end + 1;
    }
    return chunks;
}

// Function to format text into Notion blocks with appropriate styling
function formatTextBlocks(text) {
    const lines = text.split('\n');
    const blocks = [];

    lines.forEach(line => {
        if (line.startsWith('## ')) {
            blocks.push({
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: line.substring(3) } }]
                }
            });
        } else if (line.startsWith('* ')) {
            blocks.push({
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
                }
            });
        } else if (line.startsWith('**')) {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: { content: line.substring(2, line.length - 2) },
                        annotations: { bold: true }
                    }]
                }
            });
        } else {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: line } }]
                }
            });
        }
    });

    return blocks;
}

  
  
  
});

// NOTIONAPIKEY: secret_cntp5rPMTRHnlzDBFzWBdM3yfn2xLAafHGL0rD23q70
// PARENTPAGEID: 30f761aa28b548dbba16996579436fa4
