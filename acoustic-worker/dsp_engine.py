import io
import os
import re
import math
import subprocess
import tempfile
from typing import List, Dict, Any, Tuple, Optional

import numpy as np
import soundfile as sf
import librosa
import parselmouth
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
from num2words import num2words
from phonemizer import phonemize
from faster_whisper import WhisperModel
import torch
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

# ==============================================================================
# 1. SINGLETON MODEL LOADER (CPU INT8 / OPEN-WEIGHTS)
# ==============================================================================

class AcousticModelRegistry:
    _whisper: Optional[WhisperModel] = None
    _w2v_processor: Optional[Wav2Vec2Processor] = None
    _w2v_model: Optional[Wav2Vec2ForCTC] = None

    @classmethod
    def get_whisper(cls) -> WhisperModel:
        if cls._whisper is None:
            model_size = os.getenv("WHISPER_MODEL_SIZE", "base.en")
            cls._whisper = WhisperModel(model_size, device="cpu", compute_type="int8")
        return cls._whisper

    @classmethod
    def get_wav2vec2_ipa(cls) -> Tuple[Wav2Vec2Processor, Wav2Vec2ForCTC]:
        if cls._w2v_processor is None or cls._w2v_model is None:
            model_id = os.getenv("WAV2VEC2_IPA_MODEL", "facebook/wav2vec2-lv-60-espeak-cv-ft")
            cls._w2v_processor = Wav2Vec2Processor.from_pretrained(model_id)
            cls._w2v_model = Wav2Vec2ForCTC.from_pretrained(model_id)
            cls._w2v_model.eval()
        return cls._w2v_processor, cls._w2v_model


# ==============================================================================
# 2. DIALECT-AWARE PHONETIC & ORTHOGRAPHIC CONSTANTS (en-US vs en-GB)
# ==============================================================================

CONVERSATIONAL_FILLERS = {
    "uh", "um", "umm", "uhh", "hmm", "hm", "uhu", "uhuh", "mhm", "er", "erm", "ah", "oh", "eh", "huh"
}

# Dialect-specific letter names in IPA (crucial for oral spelling exercises: E R N E S T O, C-A-T)
LETTER_NAME_IPA: Dict[str, Dict[str, str]] = {
    "en-US": {
        "a": "eɪ", "b": "biː", "c": "siː", "d": "diː", "e": "iː", "f": "ɛf",
        "g": "dʒiː", "h": "eɪtʃ", "i": "aɪ", "j": "dʒeɪ", "k": "keɪ", "l": "ɛl",
        "m": "ɛm", "n": "ɛn", "o": "oʊ", "p": "piː", "q": "kjuː", "r": "ɑːɹ",
        "s": "ɛs", "t": "tiː", "u": "juː", "v": "viː", "w": "dʌbəljuː", "x": "ɛks",
        "y": "waɪ", "z": "ziː"
    },
    "en-GB": {
        "a": "eɪ", "b": "biː", "c": "siː", "d": "diː", "e": "iː", "f": "ɛf",
        "g": "dʒiː", "h": "eɪtʃ", "i": "aɪ", "j": "dʒeɪ", "k": "keɪ", "l": "ɛl",
        "m": "ɛm", "n": "ɛn", "o": "əʊ", "p": "piː", "q": "kjuː", "r": "ɑː",
        "s": "ɛs", "t": "tiː", "u": "juː", "v": "viː", "w": "dʌbəljuː", "x": "ɛks",
        "y": "waɪ", "z": "zɛd"
    }
}

# Phonetic transcriptions commonly emitted by Whisper when a speaker spells individual letters
SPOKEN_LETTER_ALIASES: Dict[str, str] = {
    "a": "a", "ay": "a", "hey": "a",
    "b": "b", "bee": "b", "be": "b",
    "c": "c", "see": "c", "sea": "c",
    "d": "d", "dee": "d",
    "e": "e", "ee": "e", "he": "e",
    "f": "f", "ef": "f", "eff": "f",
    "g": "g", "gee": "g", "jee": "g",
    "h": "h", "aitch": "h", "haitch": "h",
    "i": "i", "eye": "i",
    "j": "j", "jay": "j",
    "k": "k", "kay": "k", "okay": "k",
    "l": "l", "el": "l", "ell": "l",
    "m": "m", "em": "m",
    "n": "n", "en": "n", "in": "n",
    "o": "o", "oh": "o", "owe": "o",
    "p": "p", "pee": "p", "pea": "p",
    "q": "q", "cue": "q", "queue": "q",
    "r": "r", "are": "r", "ar": "r",
    "s": "s", "es": "s", "ess": "s",
    "t": "t", "tee": "t", "tea": "t",
    "u": "u", "you": "u",
    "v": "v", "vee": "v",
    "w": "w", "doubleu": "w", "doubleyou": "w",
    "x": "x", "ex": "x",
    "y": "y", "why": "y",
    "z": "z", "zee": "z", "zed": "z"
}

# Articulatory feature groups for graded phoneme similarity (Likeness, Not Clone)
IPA_VOWELS = set("iɪeɛæaɑɒɔoʊuʌɜəɚɝaɪaʊɔɪeɪoʊəʊ")
IPA_STOPS = set("pbtdkgʔɾ")
IPA_FRICATIVES = set("fvθðszʃʒhʤʧ")
IPA_SIBILANTS = set("szʃʒʤʧ")
IPA_NASALS = set("mnŋ")
IPA_APPROXIMANTS = set("lɹjwr")

CLOSE_PHONEME_PAIRS = {
    ("i", "ɪ"), ("e", "ɛ"), ("ɛ", "æ"), ("ɑ", "ɒ"), ("ɔ", "o"), ("u", "ʊ"),
    ("ʌ", "ə"), ("ɜ", "ə"), ("ɚ", "ə"), ("ɝ", "ɜ"), ("o", "ə"),
    ("p", "b"), ("t", "d"), ("k", "g"), ("f", "v"), ("θ", "ð"), ("θ", "s"),
    ("ð", "d"), ("ð", "z"), ("s", "z"), ("ʃ", "ʒ"), ("ʃ", "ʧ"), ("ʒ", "ʤ"),
    ("b", "v"), ("m", "n"), ("n", "ŋ"), ("l", "ɹ"), ("ɹ", "r"), ("t", "ɾ"), ("d", "ɾ")
}


# ==============================================================================
# 3. FFMPEG 16kHz MONO NORMALIZATION & VOICE ACTIVITY DETECTION (VAD)
# ==============================================================================

def normalize_audio_to_16k_mono(raw_bytes: bytes) -> Tuple[np.ndarray, int]:
    """
    Converts any input container (WebM/Opus, MP4/AAC from iOS, WAV, OGG) to
    16kHz Mono 16-bit PCM WAV using ffmpeg, plus high-pass filtering at 70Hz
    to strip microphone rumble and AC hum.
    """
    with tempfile.NamedTemporaryFile(suffix=".input", delete=False) as in_tmp, \
         tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out_tmp:
        in_path = in_tmp.name
        out_path = out_tmp.name
        in_tmp.write(raw_bytes)

    try:
        cmd = [
            "ffmpeg", "-y", "-i", in_path,
            "-af", "highpass=f=70,lowpass=f=7800",
            "-ac", "1", "-ar", "16000",
            "-acodec", "pcm_s16le", out_path
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        audio, sr = sf.read(out_path, dtype="float32")
        if audio.ndim > 1:
            audio = np.mean(audio, axis=1)
        # Peak normalize to -1 dBFS if signal is present
        peak = float(np.max(np.abs(audio))) if len(audio) > 0 else 0.0
        if peak > 0.005:
            audio = (audio / peak) * 0.89
        return audio, sr
    finally:
        for p in (in_path, out_path):
            if os.path.exists(p):
                try:
                    os.remove(p)
                except OSError:
                    pass


def trim_and_segment_vad(audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
    """
    Performs adaptive energy + zero-crossing Voice Activity Detection (VAD).
    Trims leading and trailing silence while preserving internal pauses so
    inter-word pause gaps can be measured accurately.
    """
    if len(audio) < int(sr * 0.15):
        return {
            "trimmed_audio": audio,
            "trim_start_sec": 0.0,
            "active_duration_sec": 0.0,
            "total_voiced_sec": 0.0,
            "speech_islands": [],
            "pauses": []
        }

    hop_length = int(sr * 0.010)  # 10ms hop
    frame_length = int(sr * 0.025)  # 25ms window
    rms = librosa.feature.rms(y=audio, frame_length=frame_length, hop_length=hop_length)[0]
    zcr = librosa.feature.zero_crossing_rate(y=audio, frame_length=frame_length, hop_length=hop_length)[0]

    sorted_rms = np.sort(rms)
    noise_floor = float(sorted_rms[int(len(sorted_rms) * 0.15)]) if len(sorted_rms) > 0 else 0.001
    peak_rms = float(sorted_rms[int(len(sorted_rms) * 0.95)]) if len(sorted_rms) > 0 else 0.01

    if peak_rms < 0.012 or (peak_rms / max(0.0005, noise_floor)) < 2.2:
        return {
            "trimmed_audio": np.array([], dtype=np.float32),
            "trim_start_sec": 0.0,
            "active_duration_sec": 0.0,
            "total_voiced_sec": 0.0,
            "speech_islands": [],
            "pauses": []
        }

    thresh = max(0.008, min(0.035, noise_floor * 3.0, peak_rms * 0.12))
    active_mask = (rms >= thresh) | ((rms >= thresh * 0.55) & (zcr >= 0.16))

    # Smooth mask (close micro-gaps <= 40ms, drop spikes <= 20ms)
    islands: List[Tuple[int, int]] = []
    in_island = False
    start_f = 0
    gap_count = 0

    for idx, is_act in enumerate(active_mask):
        if is_act:
            if not in_island:
                in_island = True
                start_f = idx
            gap_count = 0
        else:
            if in_island:
                gap_count += 1
                if gap_count >= 5:  # 50ms silence closes island
                    end_f = idx - gap_count + 1
                    if end_f - start_f >= 3:
                        islands.append((start_f, end_f))
                    in_island = False
                    gap_count = 0

    if in_island and (len(active_mask) - start_f) >= 3:
        islands.append((start_f, len(active_mask)))

    if not islands:
        return {
            "trimmed_audio": np.array([], dtype=np.float32),
            "trim_start_sec": 0.0,
            "active_duration_sec": 0.0,
            "total_voiced_sec": 0.0,
            "speech_islands": [],
            "pauses": []
        }

    first_frame = max(0, islands[0][0] - 3)
    last_frame = min(len(rms), islands[-1][1] + 3)

    start_sample = first_frame * hop_length
    end_sample = min(len(audio), last_frame * hop_length)
    trimmed = audio[start_sample:end_sample]
    trim_start_sec = round(first_frame * 0.010, 3)

    speech_islands_sec = []
    pauses_sec = []
    total_voiced_frames = 0

    for idx, (s_f, e_f) in enumerate(islands):
        total_voiced_frames += (e_f - s_f)
        s_sec = round((s_f - first_frame) * 0.010, 3)
        e_sec = round((e_f - first_frame) * 0.010, 3)
        speech_islands_sec.append({"start": s_sec, "end": e_sec, "duration": round(e_sec - s_sec, 3)})
        if idx > 0:
            prev_end_f = islands[idx - 1][1]
            pause_dur = round((s_f - prev_end_f) * 0.010, 3)
            if pause_dur >= 0.12:
                pauses_sec.append({
                    "start": round((prev_end_f - first_frame) * 0.010, 3),
                    "end": s_sec,
                    "duration": pause_dur
                })

    return {
        "trimmed_audio": trimmed,
        "trim_start_sec": trim_start_sec,
        "active_duration_sec": round(len(trimmed) / sr, 3),
        "total_voiced_sec": round(total_voiced_frames * 0.010, 3),
        "speech_islands": speech_islands_sec,
        "pauses": pauses_sec
    }


# ==============================================================================
# 4. TWO-PASS ADAPTIVE PITCH (F0) & SPEAKER-INDEPENDENT PROSODY EXTRACTION
# ==============================================================================

def extract_adaptive_prosody_profile(audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
    """
    Extracts speaker-independent prosody using two-pass adaptive pitch tracking:
    - Pass 1: Broad pitch scan (65Hz - 550Hz) to discover speaker's median F0.
    - Pass 2: Narrowed pitch bounds (fmin = 0.5 * median_f0, fmax = 2.2 * median_f0)
      to prevent octave jumps across children, women, and low-voiced male speakers.
    - Converts Hz to semitones relative to speaker median and Z-score normalizes
      the contour into 50 time-normalized points for fast DTW comparison.
    """
    if len(audio) < int(sr * 0.20):
        return {
            "median_f0_hz": 0.0,
            "semitone_std": 0.0,
            "z_pitch_contour": [0.0] * 50,
            "norm_rms_contour": [0.0] * 50,
            "terminal_slope_st": 0.0,
            "intonation_direction": "flat",
            "dynamic_range_db": 0.0
        }

    snd = parselmouth.Sound(audio, sampling_frequency=sr)

    # Pass 1: Discover speaker baseline F0
    pitch_pass1 = snd.to_pitch(time_step=0.01, pitch_floor=65.0, pitch_ceiling=550.0)
    f0_pass1 = pitch_pass1.selected_array["frequency"]
    voiced_pass1 = f0_pass1[f0_pass1 > 0]

    if len(voiced_pass1) < 3:
        return {
            "median_f0_hz": 0.0,
            "semitone_std": 0.0,
            "z_pitch_contour": [0.0] * 50,
            "norm_rms_contour": [0.0] * 50,
            "terminal_slope_st": 0.0,
            "intonation_direction": "flat",
            "dynamic_range_db": 0.0
        }

    rough_median = float(np.median(voiced_pass1))
    fmin = max(50.0, round(0.5 * rough_median, 1))
    fmax = min(800.0, round(2.2 * rough_median, 1))

    # Pass 2: Speaker-adapted pitch extraction
    pitch_pass2 = snd.to_pitch(time_step=0.01, pitch_floor=fmin, pitch_ceiling=fmax)
    f0 = pitch_pass2.selected_array["frequency"]
    voiced_idx = np.where(f0 > 0)[0]

    if len(voiced_idx) < 3:
        voiced_idx = np.where(f0_pass1 > 0)[0]
        f0 = f0_pass1

    voiced_hz = f0[voiced_idx]
    median_f0 = float(np.median(voiced_hz))

    # Convert voiced F0 to semitones relative to speaker's median F0
    semitones_voiced = 12.0 * np.log2(np.maximum(voiced_hz, 1e-4) / max(median_f0, 1e-4))

    # 3-point median filter on voiced semitones to remove micro-glitches
    if len(semitones_voiced) >= 3:
        smoothed_st = np.copy(semitones_voiced)
        for i in range(1, len(semitones_voiced) - 1):
            smoothed_st[i] = float(np.median(semitones_voiced[i - 1:i + 2]))
        semitones_voiced = smoothed_st

    st_mean = float(np.mean(semitones_voiced))
    st_std = float(np.std(semitones_voiced))

    # Interpolate across unvoiced consonants for continuous DTW contour comparison
    full_time_idx = np.arange(len(f0))
    interp_st = np.interp(full_time_idx, voiced_idx, semitones_voiced)

    if st_std > 0.35:
        z_st = (interp_st - st_mean) / st_std
    else:
        z_st = interp_st - st_mean

    # Resample contour to 50 evenly spaced points
    grid_50 = np.linspace(0, len(z_st) - 1, 50)
    z_pitch_50 = [round(float(x), 4) for x in np.interp(grid_50, full_time_idx, z_st)]

    # Terminal intonation slope (last 25% of voiced frames vs preceding 25%)
    n_v = len(semitones_voiced)
    tail_len = max(2, int(n_v * 0.25))
    pre_tail = semitones_voiced[max(0, n_v - 2 * tail_len):max(1, n_v - tail_len)]
    tail = semitones_voiced[n_v - tail_len:]
    terminal_slope = float(np.mean(tail) - np.mean(pre_tail)) if len(pre_tail) > 0 else 0.0

    if terminal_slope >= 1.25:
        direction = "rising"
    elif terminal_slope <= -1.25:
        direction = "falling"
    else:
        direction = "sustained"

    # RMS Energy Envelope (50 points, peak-normalized)
    rms = librosa.feature.rms(y=audio, frame_length=400, hop_length=160)[0]
    rms_max = float(np.max(rms)) if len(rms) > 0 else 1.0
    norm_rms = rms / max(rms_max, 1e-5)
    rms_grid = np.linspace(0, len(norm_rms) - 1, 50)
    rms_50 = [round(float(x), 4) for x in np.interp(rms_grid, np.arange(len(norm_rms)), norm_rms)]

    voiced_rms = rms[rms > np.percentile(rms, 20)] if len(rms) > 4 else rms
    dyn_db = float(20.0 * np.log10(max(np.percentile(voiced_rms, 95), 1e-4) / max(np.percentile(voiced_rms, 15), 1e-4)))

    return {
        "median_f0_hz": round(median_f0, 2),
        "semitone_std": round(st_std, 3),
        "z_pitch_contour": z_pitch_50,
        "norm_rms_contour": rms_50,
        "terminal_slope_st": round(terminal_slope, 3),
        "intonation_direction": direction,
        "dynamic_range_db": round(dyn_db, 2)
    }


# ==============================================================================
# 5. PHONEMIZATION & WAV2VEC2-ESPEAK CTC IPA POSTERIOR EXTRACTION
# ==============================================================================

def text_to_ipa(text: str, dialect: str = "en-US") -> str:
    """
    Converts English text into IPA phonemes using espeak-ng (`en-us` or `en-gb`).
    """
    clean = re.sub(r"[^\w\s'-]", "", text.lower()).strip()
    if not clean:
        return ""
    lang_code = "en-gb" if dialect == "en-GB" else "en-us"
    try:
        ipa = phonemize(
            clean,
            language=lang_code,
            backend="espeak",
            strip=True,
            preserve_punctuation=False,
            with_stress=True
        )
        return ipa.strip()
    except Exception:
        return clean


def strip_stress_and_split_ipa(ipa_str: str) -> List[str]:
    """
    Splits an IPA string into individual phoneme symbols and extracts primary stress syllable index.
    """
    cleaned = ipa_str.replace("ˈ", "").replace("ˌ", "").replace(" ", "")
    # Group standard English diphthongs and affricates as single phoneme units
    multi_char = ["dʒ", "tʃ", "eɪ", "aɪ", "ɔɪ", "aʊ", "oʊ", "əʊ", "ɑː", "iː", "uː", "ɔː", "ɜː"]
    tokens: List[str] = []
    i = 0
    while i < len(cleaned):
        matched = None
        for mc in multi_char:
            if cleaned.startswith(mc, i):
                matched = mc
                break
        if matched:
            tokens.append(matched)
            i += len(matched)
        else:
            tokens.append(cleaned[i])
            i += 1
    return [t for t in tokens if t.strip()]


def extract_wav2vec2_ipa_decode(audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
    """
    Runs facebook/wav2vec2-lv-60-espeak-cv-ft to obtain frame-level CTC IPA phoneme
    segments with timestamps and confidence posteriors.
    """
    if len(audio) < int(sr * 0.12):
        return {"full_ipa": "", "phoneme_segments": []}

    processor, model = AcousticModelRegistry.get_wav2vec2_ipa()
    inputs = processor(audio, sampling_rate=sr, return_tensors="pt")

    with torch.no_grad():
        logits = model(inputs.input_values).logits[0]  # (T, V)
        probs = torch.softmax(logits, dim=-1)
        pred_ids = torch.argmax(probs, dim=-1).cpu().numpy()
        max_probs = torch.max(probs, dim=-1).values.cpu().numpy()

    blank_id = processor.tokenizer.pad_token_id
    total_duration = len(audio) / sr
    num_frames = len(pred_ids)
    frame_sec = total_duration / max(1, num_frames)

    phoneme_segments = []
    cur_id = None
    start_f = 0
    prob_acc = []

    for f_idx, (pid, pval) in enumerate(zip(pred_ids, max_probs)):
        if pid != cur_id:
            if cur_id is not None and cur_id != blank_id:
                sym = processor.tokenizer.convert_ids_to_tokens(int(cur_id)).replace(" ", "")
                if sym and sym not in ("<s>", "</s>", "<pad>", "<unk>", "|"):
                    phoneme_segments.append({
                        "ipa": sym,
                        "start": round(start_f * frame_sec, 3),
                        "end": round(f_idx * frame_sec, 3),
                        "confidence": round(float(np.mean(prob_acc)), 3)
                    })
            cur_id = pid
            start_f = f_idx
            prob_acc = [pval]
        else:
            prob_acc.append(pval)

    if cur_id is not None and cur_id != blank_id:
        sym = processor.tokenizer.convert_ids_to_tokens(int(cur_id)).replace(" ", "")
        if sym and sym not in ("<s>", "</s>", "<pad>", "<unk>", "|"):
            phoneme_segments.append({
                "ipa": sym,
                "start": round(start_f * frame_sec, 3),
                "end": round(num_frames * frame_sec, 3),
                "confidence": round(float(np.mean(prob_acc)), 3)
            })

    full_ipa = "".join(seg["ipa"] for seg in phoneme_segments)
    return {"full_ipa": full_ipa, "phoneme_segments": phoneme_segments}


def run_verbatim_whisper(audio: np.ndarray) -> List[Dict[str, Any]]:
    """
    Runs faster-whisper with word_timestamps=True and a verbatim disfluency prompt
    so stutters, filler words, numbers, and spoken forms are transcribed faithfully.
    """
    if len(audio) < 2400:
        return []
    whisper = AcousticModelRegistry.get_whisper()
    segments, _ = whisper.transcribe(
        audio,
        language="en",
        beam_size=4,
        word_timestamps=True,
        suppress_blank=False,
        condition_on_previous_text=False,
        initial_prompt="Umm, uh, hmm, w-w-wait, can, can you spell E R N E S T O? 3 6 0 7 5 2."
    )
    words: List[Dict[str, Any]] = []
    for seg in segments:
        if not seg.words:
            continue
        for w in seg.words:
            clean_w = re.sub(r"[^\w'-]", "", w.word.strip().lower())
            if clean_w:
                words.append({
                    "word": clean_w,
                    "raw_word": w.word.strip(),
                    "start": round(float(w.start), 3),
                    "end": round(float(w.end), 3),
                    "probability": round(float(w.probability), 3)
                })
    return words


# ==============================================================================
# 6. SAMPLE-GROUND-TRUTH NORMALIZER (NUMBERS, DATES, CURRENCY, ORAL SPELLING)
# ==============================================================================

def generate_token_spoken_candidates(raw_token: str, dialect: str) -> List[Tuple[str, str]]:
    """
    Generates candidate (spoken_words, ipa_string) pairs for any display token:
    - Single letters ('E', 'R', 'C-A-T'): maps to dialect-specific letter name IPA.
    - Numbers ('120', '1998', '$4.50', '3'): generates cardinal, year, currency, and digit-by-digit candidates.
    - Titles ('Mr.', 'Mrs.', 'Dr.'): expands to full spoken word.
    """
    clean_punct = re.sub(r"^[^\w$£€]+|[^\w%]+$", "", raw_token).strip()
    lower = clean_punct.lower()
    lang_num = "en_GB" if dialect == "en-GB" else "en"
    letter_map = LETTER_NAME_IPA.get(dialect, LETTER_NAME_IPA["en-US"])

    candidates: List[Tuple[str, str]] = []

    # 1. Hyphenated oral spelling (e.g., "C-A-T" or "U.S.A.")
    if re.match(r"^[a-zA-Z](?:[-.][a-zA-Z])+$", clean_punct):
        letters = [ch.lower() for ch in re.findall(r"[a-zA-Z]", clean_punct)]
        ipa_joined = "".join(letter_map.get(ch, ch) for ch in letters)
        candidates.append((" ".join(letters), ipa_joined))
        return candidates

    # 2. Single alphabet letter (e.g., "E" in "E R N E S T O")
    if len(lower) == 1 and lower.isalpha():
        ltr_ipa = letter_map.get(lower, text_to_ipa(lower, dialect))
        candidates.append((lower, ltr_ipa))
        if lower == "a":
            candidates.append(("a", "ə"))
        return candidates

    # 3. Currency (e.g., "$4.50")
    curr_match = re.match(r"^([$£€])(\d+)(?:\.(\d{1,2}))?$", clean_punct)
    if curr_match:
        sym, maj, mins = curr_match.groups()
        curr_word = "pounds" if sym == "£" else "euros" if sym == "€" else "dollars"
        maj_w = num2words(int(maj), lang=lang_num)
        if mins and int(mins) > 0:
            min_w = num2words(int(mins), lang=lang_num)
            spoken_1 = f"{maj_w} {min_w}"
            spoken_2 = f"{maj_w} {curr_word} and {min_w}"
            candidates.append((spoken_1, text_to_ipa(spoken_1, dialect)))
            candidates.append((spoken_2, text_to_ipa(spoken_2, dialect)))
        else:
            spoken = f"{maj_w} {curr_word}"
            candidates.append((spoken, text_to_ipa(spoken, dialect)))
        return candidates

    # 4. Pure numbers / years / digits (e.g., "120", "1998", "3")
    if re.match(r"^\d+$", lower):
        val = int(lower)
        # Candidate A: Standard cardinal ("one hundred and twenty" / "one hundred twenty")
        cardinal = num2words(val, lang=lang_num).replace("-", " ")
        candidates.append((cardinal, text_to_ipa(cardinal, dialect)))
        cardinal_no_and = re.sub(r"\band\b", "", cardinal).strip()
        if cardinal_no_and != cardinal:
            candidates.append((cardinal_no_and, text_to_ipa(cardinal_no_and, dialect)))

        # Candidate B: 4-digit year ("1998" -> "nineteen ninety eight")
        if len(lower) == 4 and 1100 <= val <= 2099:
            hi, lo = int(lower[:2]), int(lower[2:])
            yr_words = f"{num2words(hi, lang=lang_num)} {num2words(lo, lang=lang_num) if lo > 0 else 'hundred'}".replace("-", " ")
            candidates.append((yr_words, text_to_ipa(yr_words, dialect)))

        # Candidate C: Digit-by-digit ("120" -> "one two oh" / "one two zero")
        digit_words_zero = " ".join("zero" if d == "0" else num2words(int(d), lang=lang_num) for d in lower)
        digit_words_oh = " ".join("oh" if d == "0" else num2words(int(d), lang=lang_num) for d in lower)
        candidates.append((digit_words_zero, text_to_ipa(digit_words_zero, dialect)))
        if digit_words_oh != digit_words_zero:
            candidates.append((digit_words_oh, text_to_ipa(digit_words_oh, dialect)))

        return candidates

    # 5. Titles & Contractions
    title_map = {"mr": "mister", "mrs": "missus", "ms": "miss", "dr": "doctor", "st": "street"}
    if lower in title_map:
        exp = title_map[lower]
        candidates.append((exp, text_to_ipa(exp, dialect)))
        return candidates

    # 6. Standard word
    ipa = text_to_ipa(lower, dialect)
    candidates.append((lower, ipa))
    return candidates


# ==============================================================================
# 7. PHONEME SIMILARITY & ISLAND-ANCHORED ALIGNMENT MATH
# ==============================================================================

def phoneme_pair_similarity(p1: str, p2: str) -> float:
    """
    Returns articulatory likeness score [0.0 .. 1.0] between two IPA phoneme symbols.
    """
    if p1 == p2:
        return 1.0
    base1 = p1.replace("ː", "")
    base2 = p2.replace("ː", "")
    if base1 == base2:
        return 0.90  # Vowel length difference only
    if (base1, base2) in CLOSE_PHONEME_PAIRS or (base2, base1) in CLOSE_PHONEME_PAIRS:
        return 0.72
    if (base1 in IPA_VOWELS and base2 in IPA_VOWELS):
        return 0.50
    if (base1 in IPA_SIBILANTS and base2 in IPA_SIBILANTS) or \
       (base1 in IPA_NASALS and base2 in IPA_NASALS) or \
       (base1 in IPA_STOPS and base2 in IPA_STOPS):
        return 0.55
    return 0.0


def sequence_ipa_likeness(target_ipa_list: List[str], student_ipa_list: List[str]) -> Tuple[float, List[str]]:
    """
    Aligns target IPA phoneme list against student IPA phoneme list using Needleman-Wunsch
    with articulatory similarity weights. Returns (likeness_0_to_100, diagnostic_notes).
    """
    if not target_ipa_list:
        return 100.0, []
    if not student_ipa_list:
        return 0.0, ["Sound omitted"]

    N = len(target_ipa_list)
    M = len(student_ipa_list)
    gap_pen = -0.35

    dp = np.zeros((N + 1, M + 1), dtype=np.float32)
    for i in range(1, N + 1):
        dp[i, 0] = i * gap_pen
    for j in range(1, M + 1):
        dp[0, j] = j * gap_pen * 0.5

    for i in range(1, N + 1):
        for j in range(1, M + 1):
            sim = phoneme_pair_similarity(target_ipa_list[i - 1], student_ipa_list[j - 1])
            step = sim if sim > 0 else -0.25
            dp[i, j] = max(
                dp[i - 1, j - 1] + step,
                dp[i - 1, j] + gap_pen,
                dp[i, j - 1] + gap_pen * 0.5
            )

    # Backtrack for diagnostics
    diagnostics: List[str] = []
    ci, cj = N, M
    matched_score = 0.0

    while ci > 0 or cj > 0:
        if ci > 0 and cj > 0:
            sim = phoneme_pair_similarity(target_ipa_list[ci - 1], student_ipa_list[cj - 1])
            step = sim if sim > 0 else -0.25
            if abs(dp[ci, cj] - (dp[ci - 1, cj - 1] + step)) < 1e-4:
                matched_score += max(0.0, sim)
                if sim < 0.85:
                    diagnostics.append(f"/{target_ipa_list[ci - 1]}/ sounded like /{student_ipa_list[cj - 1]}/")
                ci -= 1
                cj -= 1
                continue
        if ci > 0 and (cj == 0 or abs(dp[ci, cj] - (dp[ci - 1, cj] + gap_pen)) < 1e-4):
            diagnostics.append(f"Missing /{target_ipa_list[ci - 1]}/ sound")
            ci -= 1
        else:
            cj -= 1

    raw_ratio = matched_score / max(1, N)
    extra_len_pen = max(0.0, (M - N * 1.6) * 0.08)
    final_score = max(0.0, min(100.0, (raw_ratio - extra_len_pen) * 100.0))
    return round(final_score, 2), list(reversed(diagnostics))[:2]


# ==============================================================================
# 8. PUBLIC ENDPOINT 1: BUILD REFERENCE ACOUSTIC PROFILE (/ingest-sample)
# ==============================================================================

def build_reference_acoustic_profile(
    raw_audio_bytes: bytes,
    display_text: str,
    dialect: str = "en-US"
) -> Dict[str, Any]:
    """
    Ingests the teacher/sample recording and builds the ground-truth
    reference_acoustic_profile JSONB.
    """
    audio, sr = normalize_audio_to_16k_mono(raw_audio_bytes)
    vad = trim_and_segment_vad(audio, sr)
    trimmed = vad["trimmed_audio"]

    prosody = extract_adaptive_prosody_profile(trimmed, sr)
    whisper_words = run_verbatim_whisper(trimmed)
    w2v_decode = extract_wav2vec2_ipa_decode(trimmed, sr)

    raw_display_tokens = [t for t in display_text.strip().split() if t]
    sample_spoken_str = " ".join(w["word"] for w in whisper_words)
    sample_full_ipa = strip_stress_and_split_ipa(w2v_decode["full_ipa"])

    token_profiles: List[Dict[str, Any]] = []
    num_tokens = len(raw_display_tokens)
    active_dur = max(0.2, vad["active_duration_sec"])

    for idx, raw_tok in enumerate(raw_display_tokens):
        clean_word = re.sub(r"[^\w'-]", "", raw_tok.lower())
        is_filler = clean_word in CONVERSATIONAL_FILLERS
        candidates = generate_token_spoken_candidates(raw_tok, dialect)

        # Pick the candidate whose spoken form or IPA best matches the sample's actual audio
        chosen_spoken, chosen_ipa_str = candidates[0]
        if len(candidates) > 1:
            best_cand_score = -1.0
            for cand_spoken, cand_ipa in candidates:
                cand_ipa_list = strip_stress_and_split_ipa(cand_ipa)
                if cand_spoken in sample_spoken_str:
                    chosen_spoken, chosen_ipa_str = cand_spoken, cand_ipa
                    break
                sim_score, _ = sequence_ipa_likeness(cand_ipa_list, sample_full_ipa)
                if sim_score > best_cand_score:
                    best_cand_score = sim_score
                    chosen_spoken, chosen_ipa_str = cand_spoken, cand_ipa

        ipa_symbols = strip_stress_and_split_ipa(chosen_ipa_str)

        # Estimate primary stressed syllable index (0-based) from espeak stress marker 'ˈ'
        primary_stress_syllable = 0
        if "ˈ" in chosen_ipa_str:
            prefix = chosen_ipa_str.split("ˈ")[0]
            vowels_before = [c for c in prefix if c in IPA_VOWELS]
            primary_stress_syllable = len(vowels_before)

        # Approximate expected timing window in the sample
        est_start = round((idx / max(1, num_tokens)) * active_dur, 3)
        est_end = round(((idx + 1) / max(1, num_tokens)) * active_dur, 3)
        if idx < len(whisper_words):
            est_start = whisper_words[idx]["start"]
            est_end = whisper_words[idx]["end"]

        token_profiles.append({
            "token_index": idx,
            "display_text": raw_tok,
            "clean_token": clean_word,
            "is_filler": is_filler,
            "is_single_letter": len(clean_word) == 1 and clean_word.isalpha(),
            "spoken_form": chosen_spoken,
            "expected_ipa": chosen_ipa_str,
            "ipa_symbols": ipa_symbols,
            "primary_stress_syllable": primary_stress_syllable,
            "sample_start_sec": est_start,
            "sample_end_sec": est_end,
            "sample_duration_sec": round(max(0.08, est_end - est_start), 3)
        })

    content_token_count = sum(1 for t in token_profiles if not t["is_filler"])
    sample_wpm = round((content_token_count / max(0.25, vad["total_voiced_sec"])) * 60.0, 1)

    return {
        "dialect": dialect,
        "display_text": display_text.strip(),
        "active_duration_sec": vad["active_duration_sec"],
        "total_voiced_sec": vad["total_voiced_sec"],
        "sample_wpm": sample_wpm,
        "pauses": vad["pauses"],
        "prosody": prosody,
        "tokens": token_profiles
    }


# ==============================================================================
# 9. PUBLIC ENDPOINT 2: ISLAND-ANCHORED ATTEMPT EVALUATION (/analyze-attempt)
# ==============================================================================

def analyze_student_attempt(
    student_audio_bytes: bytes,
    reference_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates a student's audio recording against the cached reference_acoustic_profile.
    - Isolates stutters, false starts, and fillers into `inter_word_events` WITHOUT
      penalizing the word's phoneme likeness score.
    - Uses Island-Anchored Sequence Alignment so skipped or wrong words never cause
      a domino-effect shift on subsequent words.
    """
    dialect = reference_profile.get("dialect", "en-US")
    ref_tokens: List[Dict[str, Any]] = reference_profile.get("tokens", [])
    ref_prosody: Dict[str, Any] = reference_profile.get("prosody", {})

    audio, sr = normalize_audio_to_16k_mono(student_audio_bytes)
    vad = trim_and_segment_vad(audio, sr)
    trimmed = vad["trimmed_audio"]

    if len(trimmed) < int(sr * 0.18) or vad["total_voiced_sec"] < 0.14:
        return {
            "is_ghost_attempt": True,
            "active_duration_sec": 0.0,
            "student_wpm": 0.0,
            "sample_wpm": reference_profile.get("sample_wpm", 0.0),
            "recognized_transcript": "",
            "token_evaluations": [
                {
                    "token_index": t["token_index"],
                    "display_text": t["display_text"],
                    "is_filler": t.get("is_filler", False),
                    "omitted": not t.get("is_filler", False),
                    "likeness_score": 100.0 if t.get("is_filler", False) else 0.0,
                    "observed_ipa": "",
                    "diagnostics": ["No speech detected"] if not t.get("is_filler", False) else []
                }
                for t in ref_tokens
            ],
            "inter_word_events": [],
            "prosody_comparison": {
                "pitch_contour_similarity": 0.0,
                "intonation_direction_match": False,
                "cadence_ratio": 0.0,
                "expressiveness_score": 0.0
            }
        }

    student_prosody = extract_adaptive_prosody_profile(trimmed, sr)
    whisper_words = run_verbatim_whisper(trimmed)
    w2v_decode = extract_wav2vec2_ipa_decode(trimmed, sr)
    phoneme_segments = w2v_decode["phoneme_segments"]

    # Check if this exercise contains single-letter oral spelling (e.g., E R N E S T O)
    has_spelling_tokens = any(t.get("is_single_letter", False) for t in ref_tokens)
    non_spelled_targets = {
        t["clean_token"] for t in ref_tokens
        if not t.get("is_single_letter", False) and not t.get("is_filler", False)
    }

    # Step 1: Expand spoken numbers/spelling and isolate stutters & filler insertions
    cleaned_spoken_stream: List[Dict[str, Any]] = []
    inter_word_events: List[Dict[str, Any]] = []

    target_clean_seq = [t["clean_token"] for t in ref_tokens if not t.get("is_filler", False)]
    target_has_adjacent_repeat = any(
        i > 0 and target_clean_seq[i] == target_clean_seq[i - 1]
        for i in range(len(target_clean_seq))
    )

    for w_obj in whisper_words:
        w_text = w_obj["word"]
        w_start = w_obj["start"]
        w_end = w_obj["end"]

        # Isolate filler insertions ("um", "uh", "hmm")
        if w_text in CONVERSATIONAL_FILLERS and w_text != "oh":
            inter_word_events.append({
                "event_type": "filler",
                "detail": w_text,
                "start_sec": w_start,
                "end_sec": w_end,
                "duration_sec": round(w_end - w_start, 3)
            })
            continue

        # Detect internal hyphenated stutters transcribed by Whisper (e.g., "w-w-want")
        if "-" in w_obj["raw_word"] and re.match(r"^([a-zA-Z]{1,2}-)+\w+$", w_obj["raw_word"]):
            parts = w_obj["raw_word"].lower().split("-")
            w_text = parts[-1]
            inter_word_events.append({
                "event_type": "stutter",
                "detail": w_obj["raw_word"],
                "start_sec": w_start,
                "end_sec": round(w_start + (w_end - w_start) * 0.35, 3),
                "duration_sec": round((w_end - w_start) * 0.35, 3)
            })

        # If target has single-letter spelling and Whisper grouped letters into a word ("ernesto"),
        # explode into individual letter items with proportional timestamps
        if has_spelling_tokens and w_text not in non_spelled_targets:
            if w_text in SPOKEN_LETTER_ALIASES:
                mapped_ltr = SPOKEN_LETTER_ALIASES[w_text]
                ltr_ipa = LETTER_NAME_IPA.get(dialect, LETTER_NAME_IPA["en-US"]).get(mapped_ltr, mapped_ltr)
                cleaned_spoken_stream.append({
                    "word": mapped_ltr,
                    "ipa_list": strip_stress_and_split_ipa(ltr_ipa),
                    "start": w_start,
                    "end": w_end,
                    "prob": w_obj["probability"]
                })
                continue
            elif len(w_text) > 1 and w_text.isalpha():
                dur = max(0.05, w_end - w_start)
                step = dur / len(w_text)
                for c_i, ch in enumerate(w_text):
                    ltr_ipa = LETTER_NAME_IPA.get(dialect, LETTER_NAME_IPA["en-US"]).get(ch, ch)
                    cleaned_spoken_stream.append({
                        "word": ch,
                        "ipa_list": strip_stress_and_split_ipa(ltr_ipa),
                        "start": round(w_start + c_i * step, 3),
                        "end": round(w_start + (c_i + 1) * step, 3),
                        "prob": w_obj["probability"]
                    })
                continue

        # Deduplicate immediate word stutters ("can can you") into inter_word_events
        if (
            not target_has_adjacent_repeat
            and cleaned_spoken_stream
            and cleaned_spoken_stream[-1]["word"] == w_text
        ):
            prev = cleaned_spoken_stream[-1]
            inter_word_events.append({
                "event_type": "stutter",
                "detail": f"{w_text}-{w_text}",
                "start_sec": prev["start"],
                "end_sec": prev["end"],
                "duration_sec": round(prev["end"] - prev["start"], 3)
            })
            # Replace with the second (completed) realization
            cleaned_spoken_stream[-1] = {
                "word": w_text,
                "ipa_list": strip_stress_and_split_ipa(text_to_ipa(w_text, dialect)),
                "start": w_start,
                "end": w_end,
                "prob": max(prev["prob"], w_obj["probability"])
            }
            continue

        # Expand multi-digit numbers if target uses individual digit tokens
        has_single_digit_targets = any(
            len(t["clean_token"]) == 1 and t["clean_token"].isdigit() for t in ref_tokens
        )
        if has_single_digit_targets and w_text.isdigit() and len(w_text) > 1:
            dur = max(0.05, w_end - w_start)
            step = dur / len(w_text)
            for d_i, d_ch in enumerate(w_text):
                d_word = "zero" if d_ch == "0" else num2words(int(d_ch))
                cleaned_spoken_stream.append({
                    "word": d_ch,
                    "ipa_list": strip_stress_and_split_ipa(text_to_ipa(d_word, dialect)),
                    "start": round(w_start + d_i * step, 3),
                    "end": round(w_start + (d_i + 1) * step, 3),
                    "prob": w_obj["probability"]
                })
            continue

        cleaned_spoken_stream.append({
            "word": w_text,
            "ipa_list": strip_stress_and_split_ipa(text_to_ipa(w_text, dialect)),
            "start": w_start,
            "end": w_end,
            "prob": w_obj["probability"]
        })

    # Also log any inter-word pauses from VAD
    for p in vad["pauses"]:
        inter_word_events.append({
            "event_type": "pause",
            "detail": f"{p['duration']}s pause",
            "start_sec": p["start"],
            "end_sec": p["end"],
            "duration_sec": p["duration"]
        })

    # Step 2: Island-Anchored Global Sequence Alignment (Pass 1: Lock Anchor Words)
    content_ref_indices = [i for i, t in enumerate(ref_tokens) if not t.get("is_filler", False)]
    N = len(content_ref_indices)
    M = len(cleaned_spoken_stream)

    def calc_anchor_affinity(ref_tok: Dict[str, Any], spk_obj: Dict[str, Any]) -> Tuple[float, List[str]]:
        # Check all valid spoken candidates for this token (e.g. "zero" vs "oh" for "0")
        cands = generate_token_spoken_candidates(ref_tok["display_text"], dialect)
        best_sim = 0.0
        best_diag: List[str] = []

        for cand_word, cand_ipa in cands:
            if spk_obj["word"] == cand_word or spk_obj["word"] == ref_tok["clean_token"]:
                best_sim = 100.0
                best_diag = []
                break
            cand_ipa_list = strip_stress_and_split_ipa(cand_ipa)
            sim, diag = sequence_ipa_likeness(cand_ipa_list, spk_obj["ipa_list"])
            if sim > best_sim:
                best_sim = sim
                best_diag = diag

        return best_sim, best_diag

    dp = np.zeros((N + 1, M + 1), dtype=np.float32)
    choice = [["" for _ in range(M + 1)] for _ in range(N + 1)]

    for i in range(1, N + 1):
        ref_t = ref_tokens[content_ref_indices[i - 1]]
        for j in range(1, M + 1):
            spk_o = cleaned_spoken_stream[j - 1]
            sim, _ = calc_anchor_affinity(ref_t, spk_o)
            pos_bias = max(0.0, 2.0 - abs(i - j) * 0.25)
            # Only lock as an island anchor if phonetic similarity >= 45%
            diag_val = (dp[i - 1, j - 1] + sim + pos_bias) if sim >= 45.0 else -1e6
            up_val = dp[i - 1, j]
            left_val = dp[i, j - 1]

            if diag_val >= up_val and diag_val >= left_val and diag_val > 0:
                dp[i, j] = diag_val
                choice[i][j] = "DIAG"
            elif up_val >= left_val:
                dp[i, j] = up_val
                choice[i][j] = "UP"
            else:
                dp[i, j] = left_val
                choice[i][j] = "LEFT"

    anchors: List[Tuple[int, int]] = []
    ci, cj = N, M
    while ci > 0 and cj > 0:
        if choice[ci][cj] == "DIAG":
            anchors.append((ci - 1, cj - 1))
            ci -= 1
            cj -= 1
        elif choice[ci][cj] == "UP":
            ci -= 1
        else:
            cj -= 1
    anchors.reverse()

    # Step 3: Pass 2 — Resolve Anchors & Inspect Inter-Anchor Gaps (Combined Whisper + Wav2Vec2 CTC IPA)
    content_results: List[Dict[str, Any]] = [{} for _ in range(N)]
    chain = [(-1, -1)] + anchors + [(N, M)]

    for k in range(len(chain) - 1):
        curr_t, curr_s = chain[k]
        next_t, next_s = chain[k + 1]

        if 0 <= curr_t < N:
            ref_tok = ref_tokens[content_ref_indices[curr_t]]
            spk_obj = cleaned_spoken_stream[curr_s]
            whisper_sim, whisper_diag = calc_anchor_affinity(ref_tok, spk_obj)

            # Extract Wav2Vec2 CTC IPA phonemes inside this word's acoustic window
            w_start = max(0.0, spk_obj["start"] - 0.04)
            w_end = spk_obj["end"] + 0.04
            ctc_syms = [
                seg["ipa"] for seg in phoneme_segments
                if seg["end"] > w_start and seg["start"] < w_end
            ]
            ctc_Flat = strip_stress_and_split_ipa("".join(ctc_syms))
            ctc_sim, ctc_diag = sequence_ipa_likeness(ref_tok["ipa_symbols"], ctc_Flat)

            # Blend Whisper word/phoneme verification with Wav2Vec2 acoustic CTC posterior likeness
            if whisper_sim >= 95.0 and spk_obj["prob"] >= 0.72:
                combined_likeness = round(max(whisper_sim * 0.78 + max(68.0, ctc_sim) * 0.22, 88.0), 2)
            else:
                combined_likeness = round(whisper_sim * 0.65 + ctc_sim * 0.35, 2)

            diag_notes = whisper_diag if whisper_diag else (ctc_diag if combined_likeness < 85.0 else [])

            content_results[curr_t] = {
                "omitted": False,
                "likeness_score": combined_likeness,
                "observed_ipa": "".join(ctc_Flat) if ctc_Flat else "".join(spk_obj["ipa_list"]),
                "start_sec": spk_obj["start"],
                "end_sec": spk_obj["end"],
                "diagnostics": diag_notes
            }

        # Inspect the gap between curr anchor and next anchor
        gap_t_count = next_t - (curr_t + 1)
        gap_s_count = next_s - (curr_s + 1)

        if gap_t_count > 0:
            for offset in range(gap_t_count):
                t_pos = curr_t + 1 + offset
                ref_tok = ref_tokens[content_ref_indices[t_pos]]
                if offset < gap_s_count:
                    # Student spoke an unmatched/wrong word in this slot -> Red (omitted=False, low likeness)
                    wrong_spk = cleaned_spoken_stream[curr_s + 1 + offset]
                    raw_sim, raw_diag = calc_anchor_affinity(ref_tok, wrong_spk)
                    content_results[t_pos] = {
                        "omitted": False,
                        "likeness_score": round(min(42.0, raw_sim), 2),
                        "observed_ipa": "".join(wrong_spk["ipa_list"]),
                        "start_sec": wrong_spk["start"],
                        "end_sec": wrong_spk["end"],
                        "diagnostics": raw_diag or [f"Heard '{wrong_spk['word']}' instead of '{ref_tok['display_text']}'"]
                    }
                else:
                    # Zero spoken words in this gap -> Omitted (Grey Strikethrough)
                    content_results[t_pos] = {
                        "omitted": True,
                        "likeness_score": 0.0,
                        "observed_ipa": "",
                        "start_sec": None,
                        "end_sec": None,
                        "diagnostics": ["Word skipped / omitted"]
                    }

    # Attach each inter_word_event to the nearest upcoming `before_token_index`
    token_evaluations: List[Dict[str, Any]] = []
    content_lookup = {content_ref_indices[i]: content_results[i] for i in range(N)}

    for idx, t in enumerate(ref_tokens):
        if t.get("is_filler", False):
            token_evaluations.append({
                "token_index": idx,
                "display_text": t["display_text"],
                "is_filler": True,
                "omitted": False,
                "likeness_score": 100.0,
                "observed_ipa": t.get("expected_ipa", ""),
                "start_sec": None,
                "end_sec": None,
                "diagnostics": []
            })
        else:
            res = content_lookup.get(idx, {"omitted": True, "likeness_score": 0.0, "observed_ipa": "", "diagnostics": []})
            token_evaluations.append({
                "token_index": idx,
                "display_text": t["display_text"],
                "is_filler": False,
                "omitted": res["omitted"],
                "likeness_score": res["likeness_score"],
                "observed_ipa": res.get("observed_ipa", ""),
                "start_sec": res.get("start_sec"),
                "end_sec": res.get("end_sec"),
                "diagnostics": res.get("diagnostics", [])
            })

    for ev in inter_word_events:
        ev_time = ev.get("start_sec", 0.0)
        attached_idx = len(ref_tokens) - 1
        for te in token_evaluations:
            if te.get("start_sec") is not None and te["start_sec"] >= ev_time - 0.05:
                attached_idx = te["token_index"]
                break
        ev["before_token_index"] = attached_idx

    # Step 4: Speaker-Normalized Prosody & Cadence Comparison (fastdtw on Z-Score Semitones)
    ref_z_pitch = np.array(ref_prosody.get("z_pitch_contour", [0.0] * 50), dtype=np.float32).reshape(-1, 1)
    stu_z_pitch = np.array(student_prosody.get("z_pitch_contour", [0.0] * 50), dtype=np.float32).reshape(-1, 1)

    dtw_dist, _ = fastdtw(ref_z_pitch, stu_z_pitch, dist=euclidean)
    avg_step_dist = dtw_dist / 100.0
    pitch_contour_sim = round(max(0.0, min(100.0, 108.0 - avg_step_dist * 62.0)), 2)

    ref_dir = ref_prosody.get("intonation_direction", "falling")
    stu_dir = student_prosody.get("intonation_direction", "falling")
    direction_match = (ref_dir == stu_dir) or (ref_dir == "sustained")

    spoken_content_count = sum(1 for te in token_evaluations if not te["is_filler"] and not te["omitted"])
    student_wpm = round((spoken_content_count / max(0.25, vad["total_voiced_sec"])) * 60.0, 1)
    sample_wpm = float(reference_profile.get("sample_wpm", 120.0))
    cadence_ratio = round(student_wpm / max(30.0, sample_wpm), 3)

    ref_std = max(0.8, float(ref_prosody.get("semitone_std", 2.0)))
    stu_std = float(student_prosody.get("semitone_std", 1.5))
    expressiveness = round(max(40.0, min(100.0, (stu_std / ref_std) * 95.0)), 2)

    return {
        "is_ghost_attempt": False,
        "active_duration_sec": vad["active_duration_sec"],
        "total_voiced_sec": vad["total_voiced_sec"],
        "student_wpm": student_wpm,
        "sample_wpm": sample_wpm,
        "recognized_transcript": " ".join(w["word"] for w in whisper_words),
        "token_evaluations": token_evaluations,
        "inter_word_events": inter_word_events,
        "prosody_comparison": {
            "pitch_contour_similarity": pitch_contour_sim,
            "intonation_direction_match": direction_match,
            "expected_intonation": ref_dir,
            "observed_intonation": stu_dir,
            "cadence_ratio": cadence_ratio,
            "expressiveness_score": expressiveness,
            "student_median_f0_hz": student_prosody["median_f0_hz"]
        }
    }