from app import create_app

# Create an instance of the Flask application
# The create_app function is defined in app/__init__.py
app = create_app()

if __name__ == '__main__':
    # Run the Flask development server
    # host='0.0.0.0' makes the server accessible externally (e.g., within a container or local network)
    # debug=True enables the Flask debugger and reloader, which is useful for development
    # In a production environment, a proper WSGI server like Gunicorn or uWSGI should be used.
    app.run(host='0.0.0.0', port=5000, debug=True)
