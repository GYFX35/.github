from flask import Flask
import os

def create_app(test_config=None):
    """Create and configure the Flask app."""
    app = Flask(__name__, instance_relative_config=True)

    # Configure the app
    app.config.from_mapping(
        SECRET_KEY='dev',
        # Placeholders for Facebook and Google Ads - update with real values in production
        FACEBOOK_APP_ID='YOUR_FACEBOOK_APP_ID',
        FACEBOOK_APP_SECRET='YOUR_FACEBOOK_APP_SECRET',
        FACEBOOK_REDIRECT_URI='http://localhost:5000/fb_oauth_callback',
        GOOGLE_ADS_CLIENT_ID='YOUR_GOOGLE_ADS_CLIENT_ID',
        GOOGLE_ADS_CLIENT_SECRET='YOUR_GOOGLE_ADS_CLIENT_SECRET',
        GOOGLE_ADS_DEVELOPER_TOKEN='YOUR_DEVELOPER_TOKEN',
        GOOGLE_ADS_REDIRECT_URI='http://localhost:5000/google_ads_oauth_callback',
    )

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # In-memory data stores for MVP
    app.affiliate_data_store = []
    app.ad_campaign_data_store = []
    app.cloud_service_data_store = []

    # Register blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
