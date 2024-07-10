console.log("popup script injected");

document.addEventListener('DOMContentLoaded', function() {
  // Fetch summary from local storage when popup is opened
  chrome.storage.local.get('summary', function(data) {
    console.log("showing summary");
    console.log(data.summary);
    displaySummary(data.summary);
  });

  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const summaryPage = document.getElementById('summaryPage');
  const settingsPage = document.getElementById('settingsPage');
  const confirmSettingsBtn = document.getElementById('confirmSettings');

  settingsBtn.addEventListener('click', function () {

    chrome.storage.local.get(['notionApiKey', 'parentPageKey'], function(data) {
      const notionApiKey = data.notionApiKey;
      const parentPageKey = data.parentPageKey;
      if (notionApiKey !== undefined && parentPageKey !== undefined) {
        document.getElementById('notionApiKey').value = notionApiKey;
        document.getElementById('parentPageKey').value = parentPageKey;
      }
    });

    summaryPage.style.display = 'none';
    settingsPage.style.display = 'block';
  });
  closeSettingsBtn.addEventListener('click', function () {
    settingsPage.style.display = 'none';
    summaryPage.style.display = 'block';
  });

  confirmSettingsBtn.addEventListener('click', function () {
    const notionApiKey = document.getElementById('notionApiKey').value.trim();
    const parentPageKey = document.getElementById('parentPageKey').value.trim();

    if (notionApiKey === '' || parentPageKey === '') {
      alert('Please fill in all fields.');
      return;
    }

    chrome.storage.local.set({
      notionApiKey: notionApiKey,
      parentPageKey: parentPageKey
    })
    settingsPage.style.display = 'none';
    summaryPage.style.display = 'block';
  });



  function displaySummary(summaryText) {
    const summaryElement = document.getElementById('summary');
    if (summaryElement) {
      summaryElement.innerHTML = renderToHTML(summaryText);
      //get the first line of the summary to get the title
      smmry_title = summaryText.split('\n')[0];
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

    // ADD A WAIT BEFORE FETCHING!!
    chrome.storage.local.get(['notionApiKey', 'parentPageKey'], async function(data) {
      const notionApiKey = data.notionApiKey;
      const parentPageKey = data.parentPageKey;

      if (!notionApiKey || !parentPageKey) {
        console.error('API key or Parent Page ID is missing');
        return;
      }

      console.log("Using API Key:", notionApiKey);
      console.log("Using Parent Page ID:", parentPageKey);

      const chunkedText = splitTextIntoChunks(summaryText, 2000); //cuz of the api ratelimit.

  
      const childrenBlocks = [];
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
          parent: { page_id: parentPageKey },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: smmry_title
                  }
                }
              ]
            }
          },
          children: childrenBlocks 
        })
      });

      if (response.ok) {
        const responseJson = await response.json();
        const notionURL = `https://www.notion.so/${responseJson.id.replace(/-/g, '')}`;
        chrome.tabs.create({ url: notionURL });
        console.log('Notion Page URL:', notionURL);
      } else {
        const errorText = await response.text();
        console.error('Error exporting to Notion:', response.statusText, errorText);
        alert('Failed to export summary to Notion: ' + response.statusText);
      }
    });
  }

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

