# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG PYTHON_VERSION=3.8.18
FROM python:${PYTHON_VERSION}-bookworm as base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copia il file requirements.txt nell'immagine
COPY requirements.txt .
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
RUN pip install --upgrade pip
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --default-timeout=200 -r requirements.txt
RUN pip install celery
RUN pip install Flask-Session
RUN apt-get update && apt-get install -y redis-tools


# RUN --mount=type=cache,target=/root/.cache/pip \
#     --mount=type=bind,source=requirements2.txt,target=requirements2.txt \
#     python -m pip install -r requirements2.txt

# Copy the source code into the container.
COPY . .

# Expose the port that the application listens on.
EXPOSE 5000

# Imposta la variabile d'ambiente per Flask
ENV FLASK_APP=main.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run the application.
CMD python3 -m flask --app main run --host=0.0.0.0 --with-threads