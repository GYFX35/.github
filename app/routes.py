import io
from flask import Blueprint, render_template, session, current_app, flash, redirect, url_for, request

# Facebook SDK imports
from facebook_business.api import FacebookAdsApi
from facebook_business.exceptions import FacebookRequestError

# Google Ads SDK / OAuth imports
from google_auth_oauthlib.flow import Flow as GoogleAuthFlow
import uuid

# Local (app-specific) imports
from .services import (
    parse_affiliate_csv, parse_ad_campaign_csv,
    initialize_fb_api, get_fan_ad_placements_mock, get_fan_performance_data_mock,
    get_google_ads_client, list_accessible_google_ads_customers # Added Google Ads services
)
# Note: GoogleAdsException is handled in services.py, not directly in routes typically

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Serves the home page."""
    return render_template('index.html')

@main_bp.route('/affiliate-marketing')
def affiliate_marketing():
    """Serves the affiliate marketing placeholder page."""
    return render_template('affiliate_marketing.html', affiliate_data=current_app.affiliate_data_store)

@main_bp.route('/ads-optimization', methods=['GET', 'POST'])
def ads_optimization():
    """Serves the ads optimization page, handles FAN and Google Ads data fetching."""
    # Facebook related variables
    fb_connected = False
    fan_placements = []
    fan_performance_data = []
    fb_error = None

    # Google Ads related variables
    google_ads_connected = False
    google_ads_error = None
    google_ads_customers = []

    # Facebook Connection Status & API Init
    if 'fb_access_token' in session:
        fb_connected = True
        if not initialize_fb_api(session.get('fb_access_token')): # Pass token
            fb_error = "Failed to initialize Facebook API. Token might be invalid or expired."
            # session.pop('fb_access_token', None) # Optional: clear bad token
            # fb_connected = False # Keep true to show error, or false to force reconnect

    # Google Ads Connection Status
    if 'google_ads_refresh_token' in session:
        google_ads_connected = True
        # Note: Google Ads client is initialized on-demand when fetching data, not on every GET.

    # Handle POST actions for fetching data
    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'fetch_fan_data':
            if fb_connected and not fb_error:
                try:
                    fan_placements = get_fan_ad_placements_mock()
                    if fan_placements:
                        mock_placement_ids = [p['id'] for p in fan_placements]
                        fan_performance_data = get_fan_performance_data_mock(placement_ids=mock_placement_ids)
                    flash('Mock FAN data refreshed!', 'info')
                except Exception as e:
                    current_app.logger.error(f"Error fetching FAN data: {e}")
                    flash(f"Error fetching FAN data: {str(e)}", 'danger')
                    fb_error = str(e)
            elif fb_error:
                 flash(f"Cannot fetch FAN data: {fb_error}", 'warning')
            else:
                flash('Please connect to Facebook Audience Network first.', 'warning')

        elif action == 'fetch_google_ads_customers':
            if google_ads_connected:
                try:
                    gads_refresh_token = session.get('google_ads_refresh_token')
                    if not gads_refresh_token: # Should not happen if google_ads_connected is true
                        raise Exception("Google Ads refresh token not found in session.")

                    gads_client = get_google_ads_client(gads_refresh_token)
                    if gads_client:
                        google_ads_customers = list_accessible_google_ads_customers(gads_client)
                        if google_ads_customers:
                            flash(f"Successfully fetched {len(google_ads_customers)} Google Ads customer(s).", 'success')
                        else:
                            flash("No accessible Google Ads customers found.", 'info')
                    else:
                        google_ads_error = "Failed to initialize Google Ads client. Check credentials or token."
                        flash(google_ads_error, 'danger')
                except Exception as e: # Catches GoogleAdsException from service or others
                    current_app.logger.error(f"Error fetching Google Ads customers: {e}")
                    google_ads_error = str(e)
                    flash(f"Error fetching Google Ads customers: {google_ads_error}", 'danger')
            else:
                flash('Please connect to Google Ads first.', 'warning')

    return render_template(
        'ads_optimization.html',
        ad_campaign_data=current_app.ad_campaign_data_store,
        fb_connected=fb_connected,
        fan_placements=fan_placements,
        fan_performance_data=fan_performance_data,
        fb_error=fb_error,
        google_ads_connected=google_ads_connected,
        google_ads_error=google_ads_error,
        google_ads_customers=google_ads_customers
    )

# ... (CSV Upload routes - upload_affiliate_csv_route, upload_ad_csv_route - remain unchanged)
@main_bp.route('/affiliate-marketing/upload-csv', methods=['GET', 'POST'])
def upload_affiliate_csv_route():
    if request.method == 'POST':
        if 'file' not in request.files: flash('No file part', 'danger'); return redirect(request.url)
        file = request.files['file']
        if file.filename == '': flash('No selected file', 'danger'); return redirect(request.url)
        if file and file.filename.endswith('.csv'):
            try:
                csv_content = file.stream.read().decode('utf-8'); file_stream = io.StringIO(csv_content)
                new_data, errors = parse_affiliate_csv(file_stream)
                if errors:
                    for error in errors: flash(f'Error processing CSV: {error}', 'danger')
                if new_data:
                    current_app.affiliate_data_store.extend(new_data)
                    flash(f'Successfully uploaded and processed {len(new_data)} affiliate records.', 'success')
                elif not errors: flash('CSV processed, but no new valid data found.', 'warning')
                return redirect(url_for('main.affiliate_marketing'))
            except Exception as e: current_app.logger.error(f"Err affiliate CSV: {e}"); flash(f'Err: {e}', 'danger'); return redirect(request.url)
        else: flash('Invalid file type. CSV only.', 'danger'); return redirect(request.url)
    return render_template('upload_affiliate_data.html')

@main_bp.route('/ads-optimization/upload-csv', methods=['GET', 'POST'])
def upload_ad_csv_route():
    if request.method == 'POST':
        if 'file' not in request.files: flash('No file part', 'danger'); return redirect(request.url)
        file = request.files['file']
        if file.filename == '': flash('No selected file', 'danger'); return redirect(request.url)
        if file and file.filename.endswith('.csv'):
            try:
                csv_content = file.stream.read().decode('utf-8'); file_stream = io.StringIO(csv_content)
                new_data, errors = parse_ad_campaign_csv(file_stream)
                if errors:
                    for error in errors: flash(f'Error processing CSV: {error}', 'danger')
                if new_data:
                    current_app.ad_campaign_data_store.extend(new_data)
                    flash(f'Successfully processed {len(new_data)} ad campaign records.', 'success')
                elif not errors: flash('CSV processed, but no new valid data found.', 'warning')
                return redirect(url_for('main.ads_optimization'))
            except Exception as e: current_app.logger.error(f"Err ad CSV: {e}"); flash(f'Err: {e}', 'danger'); return redirect(request.url)
        else: flash('Invalid file type. CSV only.', 'danger'); return redirect(request.url)
    return render_template('upload_ad_data.html')

# ... (Facebook OAuth routes - connect_facebook_fan, fb_oauth_callback - remain unchanged)
@main_bp.route('/connect-facebook-fan')
def connect_facebook_fan():
    try:
        app_id = current_app.config.get('FACEBOOK_APP_ID'); app_secret = current_app.config.get('FACEBOOK_APP_SECRET')
        redirect_uri = current_app.config.get('FACEBOOK_REDIRECT_URI')
        if not app_id or 'YOUR_FACEBOOK_APP_ID' in app_id: flash('Facebook App ID not configured.', 'danger'); return redirect(url_for('main.ads_optimization'))
        scopes = ['read_audience_network_insights', 'ads_read']
        oauth_url = FacebookAdsApi.get_oauth_url(app_id=app_id, redirect_uri=redirect_uri, scope=scopes)
        return redirect(oauth_url)
    except Exception as e: current_app.logger.error(f"FB OAuth URL err: {e}"); flash(f'FB Conn Err: {e}', 'danger'); return redirect(url_for('main.ads_optimization'))

@main_bp.route('/fb_oauth_callback')
def fb_oauth_callback():
    auth_code = request.args.get('code')
    if not auth_code: flash('Facebook auth failed.', 'danger'); return redirect(url_for('main.ads_optimization'))
    try:
        app_id = current_app.config['FACEBOOK_APP_ID']; app_secret = current_app.config['FACEBOOK_APP_SECRET']
        redirect_uri = current_app.config['FACEBOOK_REDIRECT_URI']
        s_token_info = FacebookAdsApi.get_oauth_token_from_code(app_id=app_id, app_secret=app_secret, redirect_uri=redirect_uri, code=auth_code)
        l_token_info = FacebookAdsApi.get_long_lived_token(app_id=app_id, app_secret=app_secret, short_lived_token=s_token_info['access_token'])
        session['fb_access_token'] = l_token_info['access_token']
        flash('Successfully connected to Facebook!', 'success')
    except FacebookRequestError as e: current_app.logger.error(f"FB API err: {e.api_error_message()}"); flash(f'FB API Err: {e.api_error_message()}', 'danger')
    except KeyError: current_app.logger.error(f"FB KeyErr token"); flash('FB Token Err: Missing data.', 'danger')
    except Exception as e: current_app.logger.error(f"FB OAuth Err: {e}"); flash(f'FB Err: {e}', 'danger')
    return redirect(url_for('main.ads_optimization'))

# ... (Google Ads OAuth Initiation - connect_google_ads - remains unchanged)
@main_bp.route('/connect-google-ads')
def connect_google_ads():
    try:
        client_id = current_app.config.get('GOOGLE_ADS_CLIENT_ID'); client_secret = current_app.config.get('GOOGLE_ADS_CLIENT_SECRET')
        redirect_uri = current_app.config.get('GOOGLE_ADS_REDIRECT_URI')
        if not all([client_id, client_secret, redirect_uri]) or 'YOUR_GOOGLE_ADS_CLIENT_ID' in client_id:
            flash('Google Ads credentials not fully configured.', 'danger'); return redirect(url_for('main.ads_optimization'))
        client_config = {"web": {"client_id": client_id, "client_secret": client_secret, "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "redirect_uris": [redirect_uri]}}
        scopes = ['https://www.googleapis.com/auth/adwords']
        flow = GoogleAuthFlow.from_client_config(client_config=client_config, scopes=scopes, redirect_uri=redirect_uri)
        state = uuid.uuid4().hex; session['google_oauth_state'] = state
        authorization_url, _ = flow.authorization_url(access_type='offline', prompt='consent', state=state, include_granted_scopes='true')
        return redirect(authorization_url)
    except Exception as e: current_app.logger.error(f"GAds OAuth URL err: {e}"); flash(f'GAds Conn Err: {e}', 'danger'); return redirect(url_for('main.ads_optimization'))

# ... (Google Ads OAuth Callback - google_ads_oauth_callback - remains unchanged)
@main_bp.route('/google_ads_oauth_callback')
def google_ads_oauth_callback():
    state_in_session = session.pop('google_oauth_state', None); state_from_google = request.args.get('state')
    if not state_in_session or state_in_session != state_from_google:
        flash('OAuth state mismatch. CSRF suspected.', 'danger'); current_app.logger.error("GAds OAuth state mismatch.")
        return redirect(url_for('main.ads_optimization'))
    auth_code = request.args.get('code')
    if not auth_code: flash('Google Ads auth failed.', 'danger'); return redirect(url_for('main.ads_optimization'))
    try:
        client_id = current_app.config.get('GOOGLE_ADS_CLIENT_ID'); client_secret = current_app.config.get('GOOGLE_ADS_CLIENT_SECRET')
        redirect_uri = current_app.config.get('GOOGLE_ADS_REDIRECT_URI')
        client_config = {"web": {"client_id": client_id, "client_secret": client_secret, "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "redirect_uris": [redirect_uri]}}
        scopes = ['https://www.googleapis.com/auth/adwords']
        flow = GoogleAuthFlow.from_client_config(client_config=client_config, scopes=scopes, redirect_uri=redirect_uri)
        flow.fetch_token(code=auth_code); credentials = flow.credentials
        if not credentials.refresh_token:
            flash('No Google Ads refresh token. Ensure offline access. Re-auth or revoke app access in Google settings.', 'warning')
            current_app.logger.warning("GAds OAuth: Refresh token not obtained.")
            if credentials.token: session['google_ads_access_token'] = credentials.token; session['google_ads_access_token_expiry'] = credentials.expiry.isoformat() if credentials.expiry else None; flash('Connected (Access Token only). Short-lived.', 'warning')
            else: raise Exception("Failed to obtain any token from Google.")
        else:
            session['google_ads_refresh_token'] = credentials.refresh_token; current_app.logger.info("GAds: Refresh token obtained.")
            session.pop('google_ads_access_token', None); session.pop('google_ads_access_token_expiry', None)
            flash('Successfully connected to Google Ads!', 'success')
    except Exception as e: current_app.logger.error(f"GAds OAuth Callback Err: {e}"); flash(f'GAds Conn Err: {e}', 'danger')
    return redirect(url_for('main.ads_optimization'))

# ... (PWA routes - offline_page, service_worker - remain unchanged)
@main_bp.route('/offline.html')
def offline_page(): return render_template('offline.html')

@main_bp.route('/sw.js')
def service_worker(): return current_app.send_static_file('sw.js'), 200, {'Content-Type': 'application/javascript'}

# Note: For brevity, the internal logic of some existing routes like CSV uploads and Facebook OAuth
# have been represented with "# ... (content as before) ..." or shortened.
# The key changes are in the '/ads-optimization' route and the addition of Google Ads service imports.
# All routes are assumed to be correctly part of main_bp.
# Top-level imports and service function imports are consolidated.
# Flask utility imports (Blueprint, render_template etc.) are at the top.
