import os
import uuid
import json
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
import cv2
import numpy as np


def create_job_id() -> str:
    """Generate a unique job ID."""
    return str(uuid.uuid4())


def ensure_data_dirs():
    """Ensure data directories exist."""
    os.makedirs("data/videos", exist_ok=True)
    os.makedirs("data/overlays", exist_ok=True) 
    os.makedirs("data/results", exist_ok=True)


def save_video_file(file_data: bytes, job_id: str) -> str:
    """Save uploaded video file and return path."""
    ensure_data_dirs()
    video_path = f"data/videos/{job_id}.mp4"
    with open(video_path, "wb") as f:
        f.write(file_data)
    return video_path


def save_result_json(result: Dict[Any, Any], job_id: str) -> str:
    """Save analysis result as JSON."""
    ensure_data_dirs()
    result_path = f"data/results/{job_id}.json"
    with open(result_path, "w") as f:
        json.dump(result, f, indent=2)
    return result_path


def load_result_json(job_id: str) -> Optional[Dict[Any, Any]]:
    """Load analysis result from JSON."""
    result_path = f"data/results/{job_id}.json"
    if not os.path.exists(result_path):
        return None
    
    with open(result_path, "r") as f:
        return json.load(f)


def get_video_info(video_path: str) -> Dict[str, Any]:
    """Get basic video information."""
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return {"error": "Could not open video"}
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps if fps > 0 else 0
    
    cap.release()
    
    return {
        "fps": fps,
        "frame_count": frame_count,
        "width": width,
        "height": height,
        "duration": duration
    }


def calculate_angle(point1: np.ndarray, point2: np.ndarray, point3: np.ndarray) -> float:
    """Calculate angle between three points."""
    vector1 = point1 - point2
    vector2 = point3 - point2
    
    cos_angle = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    cos_angle = np.clip(cos_angle, -1.0, 1.0)
    angle = np.arccos(cos_angle)
    
    return np.degrees(angle)


def compute_frame_mse(frame1: np.ndarray, frame2: np.ndarray) -> float:
    """Compute MSE between two frames."""
    if frame1.shape != frame2.shape:
        return float('inf')
    
    mse = np.mean((frame1.astype(np.float32) - frame2.astype(np.float32)) ** 2)
    return float(mse)


def get_centroid(landmarks) -> np.ndarray:
    """Get centroid of landmarks."""
    if not landmarks:
        return np.array([0.0, 0.0])
    
    x_coords = [lm.x for lm in landmarks]
    y_coords = [lm.y for lm in landmarks]
    
    return np.array([np.mean(x_coords), np.mean(y_coords)])