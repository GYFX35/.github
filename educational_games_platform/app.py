from flask import Flask, render_template
import requests

app = Flask(__name__)

@app.route('/')
def index():
    togo_education_data = []
    try:
        response = requests.get('https://education.gouv.tg/wp-json/wp/v2/posts')
        response.raise_for_status()
        togo_education_data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Togo education data: {e}")

    return render_template('index.html', togo_education_data=togo_education_data)

if __name__ == '__main__':
    app.run(debug=True)
