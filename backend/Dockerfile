# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# --no-cache-dir reduces image size by not storing the pip cache
# --trusted-host pypi.python.org can help in some network environments
RUN pip install --no-cache-dir --trusted-host pypi.python.org -r requirements.txt

# Copy the current directory contents into the container at /app
# This includes app.py and boxing_game_logic.py
COPY . .

# Make port 8080 available to the world outside this container
# Cloud Run and other services will often expect to use a port specified by the PORT env var.
# Gunicorn will bind to this $PORT.
ENV PORT 8080
EXPOSE 8080

# Define environment variable for Flask app (optional, but good practice)
ENV FLASK_APP=app.py
# ENV FLASK_ENV=production # You might set this, though Gunicorn handles much of the prod setup

# Run app.py when the container launches using Gunicorn
# Binds to 0.0.0.0 to be accessible from outside the container on the mapped port ($PORT)
# Number of workers and threads can be adjusted based on expected load and server resources.
# --timeout 0 can be useful for services like Cloud Run that manage timeouts externally.
# For Cloud Run, it's recommended to have only 1 worker due to how it instances.
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 app:app
```
