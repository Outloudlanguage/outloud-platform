FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HOME=/app/model_cache

# Install system-level audio & phonetic dependencies (ffmpeg + espeak-ng)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    espeak-ng \
    libespeak-ng-dev \
    libsndfile1 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install CPU-optimized PyTorch first to keep the container image lean and free-tier friendly
RUN pip install --no-cache-dir \
    torch==2.4.1+cpu \
    torchaudio==2.4.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-cache open-weights int8 Whisper & Wav2Vec2-eSpeak IPA models during build
RUN python -c "\
from faster_whisper import WhisperModel; \
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC; \
WhisperModel('base.en', device='cpu', compute_type='int8'); \
Wav2Vec2Processor.from_pretrained('facebook/wav2vec2-lv-60-espeak-cv-ft'); \
Wav2Vec2ForCTC.from_pretrained('facebook/wav2vec2-lv-60-espeak-cv-ft')"

COPY dsp_engine.py .
COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]