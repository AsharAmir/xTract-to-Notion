from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import google.generativeai as genai
from apscheduler.schedulers.background import BackgroundScheduler
import requests

notion_api_key = os.getenv('NOTION_API_KEY')

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
    prompt = f"Summarize the following text in a structured, point-based format. Include EXAMPLES, PROS AND CONS ONLY IF NECESSARY, and ensure the summary length is 60% of the original and keep the summary somewhat detailed but not too lengthy. Also just start writing the summary straight away, NO NEED TO MENTION THAT YOU'RE WRITING A SUMMARY (OR AS AN AI MODEL...). No need to mention summarization as the heading title, just start writing the content. (sometimes the summary might be requested of the whole webpage and u must ignore the irrelevant menus, header, footers. also the first line of ur output must contain simply just the title of the summary without any labelling.\n\n{input_text}\n\n"
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(prompt)
    return jsonify({'summary': response.text})

def job_func():
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
