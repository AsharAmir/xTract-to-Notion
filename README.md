# xTract to Notion - Chrome Extension

xTract to Notion extension allows you to quickly export webpage summaries directly to Notion.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Configuration](#configuration)
  - [Adding the Google Generative AI API Key](#adding-the-google-generative-ai-api-key)
  - [Adding the Notion API Key and Parent Page ID](#adding-the-notion-api-key-and-parent-page-id)
- [License](#license)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AsharAmir/smmry-ext
   cd smmry-ext
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Run the application**

   ```bash
   python summary.py
   ```

2. **Access the application**

   Open your browser and navigate to `http://127.0.0.1:5000/`.

3. **Use the application**

   Enter the text you want to summarize in the textbox and click the "Summarize" button. The summarized text will be displayed in an alert box. Alternatively, you can use the summary.py file's API to send a POST request to `/summarize` and generate a summary.

## Configuration

### Adding the Google Generative AI API Key

1. Open the `summary.py` file.
2. Locate the line where the API key is configured:

   ```python
   genai.configure(api_key="YOUR_API_KEY")
   ```

3. Replace `YOUR_API_KEY` with your actual Google Generative AI API key.

### Adding the Notion API Key and Parent Page ID

1. **Obtain your Notion API Key:**

   - Go to [Notion Integrations](https://www.notion.so/my-integrations).
   - Create a new integration and copy the "Internal Integration Token".

2. **Obtain your Parent Page ID:**

   - Open the Notion page you want to use as the parent.
   - Copy the URL and extract the page ID from it. The URL format is `https://www.notion.so/yourusername/Page-Name-<PAGE_ID>`.

3. **Add the Notion API Key and Parent Page ID to the application:**

   - Open the `summary.py` file.
   - Locate the section where the Notion integration is configured and add the following lines:

   ```python
   notion_api_key = "YOUR_NOTION_API_KEY"
   parent_page_id = "YOUR_PARENT_PAGE_ID"
   ```

4. Replace `YOUR_NOTION_API_KEY` and `YOUR_PARENT_PAGE_ID` with your actual Notion API key and parent page ID.

## License

This project is licensed under the MIT License.
