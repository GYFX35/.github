from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///games.db'
app.config['SECRET_KEY'] = 'a_secret_key'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    points = db.Column(db.Integer, default=0)
    badges = db.relationship('UserBadge', backref='user', lazy=True)

class Badge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(240), nullable=False)
    icon = db.Column(db.String(120), nullable=False)

class UserBadge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.id'), nullable=False)
    badge = db.relationship('Badge', backref='user_badges')

@app.route('/')
def index():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        user.points += 1
        db.session.commit()
        check_for_new_badges(user)
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful! Please log in.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            return redirect(url_for('profile'))
        else:
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    return render_template('profile.html', user=user)

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.')
    return redirect(url_for('index'))

def check_for_new_badges(user):
    # Check for 10-point badge
    if user.points >= 10 and not has_badge(user, '10-Point Club'):
        award_badge(user, '10-Point Club')
    # Check for 100-point badge
    if user.points >= 100 and not has_badge(user, '100-Point Club'):
        award_badge(user, '100-Point Club')

def has_badge(user, badge_name):
    return any(user_badge.badge.name == badge_name for user_badge in user.badges)

def award_badge(user, badge_name):
    badge = Badge.query.filter_by(name=badge_name).first()
    if badge:
        user_badge = UserBadge(user_id=user.id, badge_id=badge.id)
        db.session.add(user_badge)
        db.session.commit()
        flash(f'Congratulations! You have earned the "{badge_name}" badge!')

def create_badges():
    with app.app_context():
        if Badge.query.count() == 0:
            badge1 = Badge(name='10-Point Club', description='Earned 10 points', icon='10-point-badge.png')
            badge2 = Badge(name='100-Point Club', description='Earned 100 points', icon='100-point-badge.png')
            db.session.add(badge1)
            db.session.add(badge2)
            db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_badges()
    app.run(debug=True)
