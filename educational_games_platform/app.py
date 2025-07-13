from flask import Flask, render_template
import requests

app = Flask(__name__)

@app.route('/')
def index():
    unesco_data = [
        {"title": "The importance of multilingual education"},
        {"title": "New framework for culture and arts education"},
        {"title": "UNESCO and partners launch new initiative to support teachers"},
        {"title": "Global report on adult learning and education"},
        {"title": "Youth voices on the future of education"}
    ]
    unicef_data = [
        {"title": "For every child, a fair chance"},
        {"title": "The State of the World's Children 2023"},
        {"title": "Violence against children: A hidden crisis"},
        {"title": "Clean water for all children"},
        {"title": "Reimagining education for every child"}
    ]
    who_data = []
    try:
        response = requests.get('https://ghoapi.azureedge.net/api/Indicator')
        response.raise_for_status()
        who_data = response.json().get('value', [])[:5]
    except requests.exceptions.RequestException as e:
        print(f"Error fetching WHO data: {e}")

    return render_template('index.html', unesco_data=unesco_data, unicef_data=unicef_data, who_data=who_data)

if __name__ == '__main__':
    app.run(debug=True)
