from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ar_game')
def ar_game():
    return render_template('ar_game.html')

if __name__ == '__main__':
    app.run(debug=True)
