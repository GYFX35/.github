from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a_secret_key'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/get_npc_response', methods=['POST'])
def get_npc_response():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        return jsonify({'error': 'NVIDIA_API_KEY environment variable not set'}), 500

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    payload = {
        "text_prompts": [
            {
                "text": prompt,
                "weight": 1
            }
        ],
        "sampler": "K_DPM_2_ANCESTRAL",
        "seed": 0,
        "steps": 25
    }

    try:
        response = requests.post("https://api.nvcf.nvidia.com/v2/nvcf/pexray/lama/4/maverick", headers=headers, json=payload)
        response.raise_for_status()
        # I am assuming the response will be in a similar format to the image generation API
        # and that the response will be in a field called 'text'
        return jsonify({'response': response.json().get('text', 'I am sorry, I do not understand.')})
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
