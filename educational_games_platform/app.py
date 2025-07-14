from flask import Flask, render_template, jsonify
import requests
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_embedding')
def get_embedding():
    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        return jsonify({'error': 'NVIDIA_API_KEY environment variable not set'}), 500

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    payload = {
        "input": "This is a sample text to get an embedding for.",
        "model": "nvidia/embed-qa-4"
    }

    try:
        response = requests.post("https://integration.api.nvidia.com/v1/embeddings", headers=headers, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
