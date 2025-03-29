from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import google.generativeai as genai
from apscheduler.schedulers.background import BackgroundScheduler
import requests
import time
from google.api_core.exceptions import ResourceExhausted

notion_api_key = os.getenv('NOTION_API_KEY')

gemini_api_key = os.getenv('GEMINI_API_KEY')
print(f"Debug: GEMINI_API_KEY is {'set' if gemini_api_key else 'not set'}")  # Debugging log

genai.configure(api_key=gemini_api_key) #NU domain
 
# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarizeText():
    request_data = request.get_json()
    input_text = request_data.get('input_text')
    print(f"Debug: Received input text: {input_text[:100]}")  # Log first 100 characters of input text
    prompt = f"Summarize the following text in a structured, point-based format. Include EXAMPLES, PROS AND CONS ONLY IF NECESSARY, and ensure the summary length is 60% of the original and keep the summary somewhat detailed but not too lengthy. Also just start writing the summary straight away, NO NEED TO MENTION THAT YOU'RE WRITING A SUMMARY (OR AS AN AI MODEL...). No need to mention summarization as the heading title, just start writing the content. (sometimes the summary might be requested of the whole webpage and u must ignore the irrelevant menus, header, footers. also the first line of ur output must contain simply just the title of the summary without any labelling.\n\n{input_text}\n\n"
    chat_session = model.start_chat(history=[])
    
    max_retries = 5
    retry_delay = 1  # Initial delay in seconds

    for attempt in range(max_retries):
        try:
            print(f"Debug: Attempt {attempt + 1} to send message to Generative AI API")  # Debugging log
            response = chat_session.send_message(prompt)
            print(f"Debug: API response received successfully")  # Debugging log
            return jsonify({'summary': response.text})
        except ResourceExhausted as e:
            print(f"Debug: ResourceExhausted error: {e}")  # Debugging log
            if attempt < max_retries - 1:
                print(f"Quota exceeded. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print("Max retries reached. Unable to process the request.")
                return jsonify({'error': 'Quota exceeded. Please try again later.'}), 429

def job_func():
    print("Debug: Running scheduled job")  # Debugging log
    try:
        headers = {'Content-Type': 'application/json'}
        data = {'input_text': 'test'}
        response = requests.post('https://smmry-ext.onrender.com/summarize', headers=headers, json=data)
        print(f"Response: {response.status_code}")
    except requests.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    #USE THE BELOW FOR LOCALHOST
    #app.run(port=5555, debug=True) 
    
    #use the below for HEROKU

    scheduler = BackgroundScheduler()
    scheduler.add_job(func=job_func, trigger="interval", minutes=10)
    scheduler.start()
    print("Scheduler started")
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
