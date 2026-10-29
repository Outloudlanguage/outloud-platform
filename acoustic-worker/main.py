import os
import base64
from typing import Dict, Any, Optional

import httpx
from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field

from dsp_engine import (
    AcousticModelRegistry,
    build_reference_acoustic_profile,
    analyze_student_attempt
)

app = FastAPI(
    title="Outloud Acoustic & Phonetic DSP Worker",
    version="2.0.0",
    description="Stateless open-source reference-based speech evaluation microservice"
)

WORKER_SECRET = os.getenv("ACOUSTIC_WORKER_SECRET", "")


def verify_worker_secret(x_worker_secret: Optional[str]) -> None:
    if WORKER_SECRET and x_worker_secret != WORKER_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized acoustic worker secret")


async def resolve_audio_bytes(
    audio_url: Optional[str] = None,
    audio_base64: Optional[str] = None,
    upload_file: Optional[UploadFile] = None
) -> bytes:
    if upload_file is not None:
        return await upload_file.read()
    if audio_base64:
        clean_b64 = audio_base64.split(",")[-1].strip()
        return base64.b64decode(clean_b64)
    if audio_url:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.get(audio_url)
            resp.raise_for_status()
            return resp.content
    raise HTTPException(status_code=400, detail="Must provide audio_url, audio_base64, or file upload")


class IngestSampleRequest(BaseModel):
    display_text: str = Field(..., min_length=1)
    dialect: str = Field(default="en-US", pattern="^(en-US|en-GB)$")
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None


class AnalyzeAttemptRequest(BaseModel):
    reference_acoustic_profile: Dict[str, Any]
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None


@app.on_event("startup")
async def preload_models():
    # Warm up quantized Whisper & Wav2Vec2-eSpeak IPA models on startup
    AcousticModelRegistry.get_whisper()
    AcousticModelRegistry.get_wav2vec2_ipa()


@app.get("/health")
async def health_check():
    return {"status": "ok", "engine": "wav2vec2-espeak-ipa + faster-whisper-int8 + parselmouth"}


@app.post("/ingest-sample")
async def ingest_sample_endpoint(
    payload: IngestSampleRequest,
    x_worker_secret: Optional[str] = Header(default=None)
):
    verify_worker_secret(x_worker_secret)
    raw_bytes = await resolve_audio_bytes(
        audio_url=payload.audio_url,
        audio_base64=payload.audio_base64
    )
    profile = build_reference_acoustic_profile(
        raw_audio_bytes=raw_bytes,
        display_text=payload.display_text,
        dialect=payload.dialect
    )
    return {"success": True, "reference_acoustic_profile": profile}


@app.post("/analyze-attempt")
async def analyze_attempt_endpoint(
    payload: AnalyzeAttemptRequest,
    x_worker_secret: Optional[str] = Header(default=None)
):
    verify_worker_secret(x_worker_secret)
    raw_bytes = await resolve_audio_bytes(
        audio_url=payload.audio_url,
        audio_base64=payload.audio_base64
    )
    analysis = analyze_student_attempt(
        student_audio_bytes=raw_bytes,
        reference_profile=payload.reference_acoustic_profile
    )
    return {"success": True, "analysis": analysis}