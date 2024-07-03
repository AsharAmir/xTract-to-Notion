from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

#genai.configure(api_key="AIzaSyBSD1sFlgCwPIOH79HLI9dZC5Yi5wz3pgw")
genai.configure(api_key="AIzaSyApqyrYE3TfP8U0KaejCu7kvUNVNnNE_-Y")

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

@app.route('/summarize', methods=['POST'])
def summarizeText():
    request_data = request.get_json()
    input_text = request_data.get('input_text')
    prompt = f"Summarize the following text in a structured, point-based format. Include EXAMPLES, PROS AND CONS ONLY IF NECESSARY, and ensure the summary length is 60% of the original and keep the summary somewhat detailed but not too lengthy. Also just start writing the summary straight away, NO NEED TO MENTION THAT YOU'RE WRITING A SUMMARY (OR AS AN AI MODEL...). No need to mention summarization as the heading title, just start writing the content. (sometimes the summary might be requested of the whole webpage and u must ignore the irrelevant menus, header, footers. also the first line of ur output must contain simply just the title of the summary without any labelling.\n\n{input_text}\n\n"
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(prompt)
    return jsonify({'summary': response.text})

if __name__ == "__main__":
    #USE THE BELOW FOR LOCALHOST
    #app.run(port=5555, debug=True) 
    
    #use the below for HEROKU
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)