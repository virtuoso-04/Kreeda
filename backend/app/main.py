"""
FastAPI backend for sports integrity analysis.
Handles video uploads, analysis, and overlay generation.
"""

import os
import json
from typing import Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import uvicorn

from .utilss import (
    create_job_id, 
    save_video_file, 
    save_result_json, 
    load_result_json,
    get_video_info
)
from .analyzee import analyze_video

# Initialize FastAPI app
app = FastAPI(
    title="Sports Integrity Analysis API",
    description="AI-powered analysis for sports performance validation",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure data directories exist
os.makedirs("data/videos", exist_ok=True)
os.makedirs("data/overlays", exist_ok=True)
os.makedirs("data/results", exist_ok=True)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Sports Integrity Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "POST /analyze - Upload and analyze video",
            "result": "GET /result/{job_id} - Get analysis result",
            "list": "GET /list - List all processed videos",
            "video": "GET /video/{job_id} - Download original video",
            "overlay": "GET /overlay/{job_id} - Download overlay video"
        }
    }


@app.post("/analyze")
async def analyze_video_endpoint(
    file: UploadFile = File(..., description="Video file to analyze"),
    athlete: Optional[str] = Form(None, description="Athlete metadata as JSON string"),
    test_type: Optional[str] = Form("pushup", description="Exercise type: pushup or situp")
):
    """
    Upload and analyze video for sports integrity.
    
    Args:
        file: Video file (MP4 recommended)
        athlete: Optional athlete metadata as JSON string
        test_type: Type of exercise being performed
        
    Returns:
        Analysis results and job ID
    """
    
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Please upload a video file (.mp4, .avi, .mov, .mkv)"
        )
    
    try:
        # Generate job ID and save file
        job_id = create_job_id()
        file_content = await file.read()
        video_path = save_video_file(file_content, job_id)
        
        # Parse athlete metadata if provided
        athlete_data = {}
        if athlete:
            try:
                athlete_data = json.loads(athlete)
            except json.JSONDecodeError:
                athlete_data = {"name": athlete}  # Treat as simple name
        
        # Get video info
        video_info = get_video_info(video_path)
        if "error" in video_info:
            raise HTTPException(status_code=400, detail=video_info["error"])
        
        # Perform analysis
        analysis_result = analyze_video(video_path, test_type)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        # Prepare complete result
        complete_result = {
            "job_id": job_id,
            "timestamp": os.path.getctime(video_path),
            "filename": file.filename,
            "athlete": athlete_data,
            "test_type": test_type,
            "video_info": video_info,
            "analysis": analysis_result,
            "status": "completed"
        }
        
        # Save result
        save_result_json(complete_result, job_id)
        
        return JSONResponse(content=complete_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/result/{job_id}")
async def get_result(job_id: str):
    """Get analysis result by job ID."""
    
    result = load_result_json(job_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    
    return JSONResponse(content=result)


@app.get("/list")
async def list_results():
    """List all processed videos and their results."""
    
    results = []
    results_dir = Path("data/results")
    
    if results_dir.exists():
        for result_file in results_dir.glob("*.json"):
            try:
                with open(result_file, "r") as f:
                    result = json.load(f)
                    # Include only summary information
                    summary = {
                        "job_id": result.get("job_id"),
                        "filename": result.get("filename"),
                        "timestamp": result.get("timestamp"),
                        "test_type": result.get("test_type"),
                        "reps": result.get("analysis", {}).get("reps", 0),
                        "valid_reps": result.get("analysis", {}).get("valid_reps", 0),
                        "cheat_flag": result.get("analysis", {}).get("cheat_flag", False),
                        "status": result.get("status")
                    }
                    results.append(summary)
            except Exception as e:
                print(f"Error reading result file {result_file}: {e}")
                continue
    
    # Sort by timestamp (newest first)
    results.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    
    return {"results": results, "count": len(results)}


@app.get("/video/{job_id}")
async def get_video(job_id: str):
    """Download original video file."""
    
    video_path = f"data/videos/{job_id}.mp4"
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"{job_id}_original.mp4"
    )


@app.get("/overlay/{job_id}")
async def get_overlay(job_id: str):
    """Download overlay video file."""
    
    overlay_path = f"data/overlays/{job_id}.mp4"
    if not os.path.exists(overlay_path):
        raise HTTPException(status_code=404, detail="Overlay not found")
    
    return FileResponse(
        overlay_path,
        media_type="video/mp4", 
        filename=f"{job_id}_overlay.mp4"
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "data_dirs": {
            "videos": len(list(Path("data/videos").glob("*.mp4"))) if Path("data/videos").exists() else 0,
            "overlays": len(list(Path("data/overlays").glob("*.mp4"))) if Path("data/overlays").exists() else 0,
            "results": len(list(Path("data/results").glob("*.json"))) if Path("data/results").exists() else 0
        }
    }


if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )