"""
Streamlit dashboard for sports integrity analysis.
Provides video upload, analysis visualization, and overlay generation.
"""

import streamlit as st
import cv2
import numpy as np
import pandas as pd
import requests
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional, Dict, Any, List
import tempfile
import time
from PIL import Image
import plotly.express as px
import plotly.graph_objects as go

# Configuration
BACKEND_URL = "http://localhost:8000"
OVERLAY_SCRIPT = "../overlay/overlay_generator.py"
VIDEO_DATA_DIR = "../backend/data/videos"
OVERLAY_DATA_DIR = "../backend/data/overlays"
RESULTS_DATA_DIR = "../backend/data/results"

# Page config
st.set_page_config(
    page_title="Sports Integrity Dashboard",
    page_icon="🏃",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
.metric-card {
    background-color: #f0f2f6;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
}
.success-metric {
    background-color: #d4edda;
    color: #155724;
}
.warning-metric {
    background-color: #fff3cd;
    color: #856404;
}
.error-metric {
    background-color: #f8d7da;
    color: #721c24;
}
</style>
""", unsafe_allow_html=True)


def check_backend_connection() -> bool:
    """Check if backend is accessible."""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False


def upload_video_to_backend(video_file, athlete_name: str = "", test_type: str = "pushup") -> Optional[Dict]:
    """Upload video to backend for analysis."""
    try:
        files = {"file": (video_file.name, video_file.getvalue(), "video/mp4")}
        data = {
            "athlete": json.dumps({"name": athlete_name}) if athlete_name else "",
            "test_type": test_type
        }
        
        with st.spinner("Uploading and analyzing video..."):
            response = requests.post(f"{BACKEND_URL}/analyze", files=files, data=data, timeout=60)
        
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Upload failed: {response.text}")
            return None
    except Exception as e:
        st.error(f"Upload error: {str(e)}")
        return None


def get_backend_results() -> List[Dict]:
    """Get list of results from backend."""
    try:
        response = requests.get(f"{BACKEND_URL}/list", timeout=10)
        if response.status_code == 200:
            return response.json().get("results", [])
        return []
    except:
        return []


def get_result_details(job_id: str) -> Optional[Dict]:
    """Get detailed result for a specific job."""
    try:
        response = requests.get(f"{BACKEND_URL}/result/{job_id}", timeout=10)
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None


def generate_overlay_for_video(video_path: str, output_path: str) -> bool:
    """Generate overlay using the overlay generator script."""
    try:
        # Check if overlay script exists
        script_path = Path(OVERLAY_SCRIPT)
        if not script_path.exists():
            st.error(f"Overlay generator not found: {script_path}")
            return False
        
        # Run overlay generation
        cmd = [
            sys.executable, str(script_path),
            video_path, output_path,
            "--sample-rate", "2",
            "--scale", "0.8"
        ]
        
        with st.spinner("Generating pose overlay..."):
            progress_bar = st.progress(0)
            
            # Simulate progress (in real implementation, you'd capture stdout)
            for i in range(100):
                time.sleep(0.05)
                progress_bar.progress(i + 1)
            
            result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            st.success("Overlay generated successfully!")
            return True
        else:
            st.error(f"Overlay generation failed: {result.stderr}")
            return False
            
    except Exception as e:
        st.error(f"Error generating overlay: {str(e)}")
        return False


def extract_frame(video_path: str, frame_number: int) -> Optional[np.ndarray]:
    """Extract a specific frame from video."""
    try:
        cap = cv2.VideoCapture(video_path)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return None
    except:
        return None


def create_report_csv(result_data: Dict) -> str:
    """Create CSV report from analysis results."""
    report_data = {
        "Job ID": [result_data.get("job_id", "")],
        "Filename": [result_data.get("filename", "")],
        "Athlete": [result_data.get("athlete", {}).get("name", "")],
        "Test Type": [result_data.get("test_type", "")],
        "Total Reps": [result_data.get("analysis", {}).get("reps", 0)],
        "Valid Reps": [result_data.get("analysis", {}).get("valid_reps", 0)],
        "Posture Score": [result_data.get("analysis", {}).get("posture_score", 0.0)],
        "Cheat Flag": [result_data.get("analysis", {}).get("cheat_flag", False)],
        "Duration (s)": [result_data.get("analysis", {}).get("duration", 0.0)],
        "Frames Processed": [result_data.get("analysis", {}).get("frames_processed", 0)]
    }
    
    df = pd.DataFrame(report_data)
    return df.to_csv(index=False)


def display_analysis_metrics(analysis: Dict):
    """Display analysis results as metrics."""
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        reps = analysis.get("reps", 0)
        st.metric("Total Reps", reps)
    
    with col2:
        valid_reps = analysis.get("valid_reps", 0)
        efficiency = (valid_reps / max(reps, 1)) * 100
        st.metric("Valid Reps", valid_reps, f"{efficiency:.1f}% efficiency")
    
    with col3:
        posture_score = analysis.get("posture_score", 0.0)
        st.metric("Posture Score", f"{posture_score:.3f}", 
                 "🟢 Good" if posture_score > 0.7 else "🟡 Fair" if posture_score > 0.5 else "🔴 Poor")
    
    with col4:
        cheat_flag = analysis.get("cheat_flag", False)
        st.metric("Integrity Check", 
                 "🔴 Failed" if cheat_flag else "🟢 Passed",
                 "Issues detected" if cheat_flag else "No issues")


def display_cheat_analysis(analysis: Dict):
    """Display detailed cheat detection analysis."""
    if not analysis.get("cheat_flag", False):
        st.success("✅ No integrity issues detected")
        return
    
    st.error("⚠️ Integrity issues detected:")
    
    cheat_reasons = analysis.get("cheat_reasons", [])
    notes = analysis.get("notes", [])
    
    for reason in cheat_reasons:
        if reason == "excessive_frame_duplication":
            st.warning("📹 Excessive frame duplication detected - possible video tampering")
        elif reason == "face_inconsistency":
            st.warning("👤 Face position inconsistency - possible identity switching")
        elif reason == "excessive_rep_rate":
            st.warning("⚡ Unphysiological repetition rate - possible speed manipulation")
    
    if notes:
        with st.expander("Technical Details"):
            for note in notes:
                st.write(f"• {note}")


def main():
    """Main dashboard application."""
    st.title("🏃 Sports Integrity Dashboard")
    st.markdown("AI-powered analysis for sports performance validation")
    
    # Check backend connection
    if not check_backend_connection():
        st.error(f"⚠️ Cannot connect to backend at {BACKEND_URL}")
        st.info("Please ensure the backend is running: `uvicorn app.main:app --reload`")
        st.stop()
    
    # Sidebar
    st.sidebar.title("Navigation")
    tab = st.sidebar.radio("Select Mode", [
        "Upload & Analyze",
        " Browse Results", 
        " Frame Analysis",
        " Instructions"
    ])
    
    if tab == "Upload & Analyze":
        st.header("Upload Video for Analysis")
        
        # Upload section
        uploaded_file = st.file_uploader(
            "Choose a video file",
            type=["mp4", "avi", "mov", "mkv"],
            help="Upload a video of push-ups or sit-ups for analysis"
        )
        
        col1, col2 = st.columns(2)
        with col1:
            athlete_name = st.text_input("Athlete Name (optional)")
        with col2:
            test_type = st.selectbox("Exercise Type", ["pushup", "situp"])
        
        if uploaded_file:
            st.video(uploaded_file)
            
            if st.button("Analyze Video", type="primary"):
                result = upload_video_to_backend(uploaded_file, athlete_name, test_type)
                
                if result:
                    st.success(" Analysis completed!")
                    
                    # Display results
                    analysis = result.get("analysis", {})
                    display_analysis_metrics(analysis)
                    
                    # Cheat detection
                    st.subheader("Integrity Analysis")
                    display_cheat_analysis(analysis)
                    
                    # Video info
                    with st.expander("Video Information"):
                        video_info = result.get("video_info", {})
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Duration", f"{video_info.get('duration', 0):.1f}s")
                        with col2:
                            st.metric("Resolution", f"{video_info.get('width', 0)}x{video_info.get('height', 0)}")
                        with col3:
                            st.metric("FPS", f"{video_info.get('fps', 0):.1f}")
                    
                    # Download report
                    csv_data = create_report_csv(result)
                    st.download_button(
                        "Download Report (CSV)",
                        csv_data,
                        file_name=f"analysis_report_{result.get('job_id', 'unknown')}.csv",
                        mime="text/csv"
                    )
    
    elif tab == "📊 Browse Results":
        st.header("Analysis Results")
        
        results = get_backend_results()
        
        if not results:
            st.info("No analysis results found. Upload a video to get started!")
            return
        
        # Results table
        df = pd.DataFrame(results)
        
        # Add some styling
        def style_cheat_flag(val):
            return "background-color: #ffebee" if val else "background-color: #e8f5e8"
        
        if not df.empty:
            styled_df = df.style.applymap(style_cheat_flag, subset=['cheat_flag'])
            st.dataframe(styled_df, use_container_width=True)
        
        # Detailed view
        if results:
            st.subheader("Detailed View")
            
            # Select result
            job_options = {f"{r['filename']} ({r['job_id'][:8]})": r['job_id'] for r in results}
            selected_display = st.selectbox("Select result to view", list(job_options.keys()))
            
            if selected_display:
                job_id = job_options[selected_display]
                detailed_result = get_result_details(job_id)
                
                if detailed_result:
                    col1, col2 = st.columns([2, 1])
                    
                    with col1:
                        # Analysis metrics
                        analysis = detailed_result.get("analysis", {})
                        display_analysis_metrics(analysis)
                        display_cheat_analysis(analysis)
                    
                    with col2:
                        # Video downloads
                        st.subheader("Downloads")
                        
                        # Original video
                        if st.button("📹 Download Original"):
                            video_url = f"{BACKEND_URL}/video/{job_id}"
                            st.write(f"[Download Original Video]({video_url})")
                        
                        # Check for overlay
                        overlay_path = Path(OVERLAY_DATA_DIR) / f"{job_id}.mp4"
                        if overlay_path.exists():
                            if st.button("🎯 Download Overlay"):
                                overlay_url = f"{BACKEND_URL}/overlay/{job_id}"
                                st.write(f"[Download Overlay Video]({overlay_url})")
                        else:
                            if st.button("🎯 Generate Overlay"):
                                video_path = Path(VIDEO_DATA_DIR) / f"{job_id}.mp4"
                                if video_path.exists():
                                    success = generate_overlay_for_video(
                                        str(video_path), 
                                        str(overlay_path)
                                    )
                                    if success:
                                        st.rerun()
    
    elif tab == " Frame Analysis":
        st.header("Frame-by-Frame Analysis")
        
        # Select from existing results
        results = get_backend_results()
        if not results:
            st.info("No videos available. Upload a video first!")
            return
        
        job_options = {f"{r['filename']} ({r['job_id'][:8]})": r['job_id'] for r in results}
        selected_display = st.selectbox("Select video", list(job_options.keys()))
        
        if selected_display:
            job_id = job_options[selected_display]
            video_path = Path(VIDEO_DATA_DIR) / f"{job_id}.mp4"
            overlay_path = Path(OVERLAY_DATA_DIR) / f"{job_id}.mp4"
            
            if video_path.exists():
                # Get video info
                cap = cv2.VideoCapture(str(video_path))
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                cap.release()
                
                # Frame slider
                frame_number = st.slider(
                    "Frame Number", 
                    0, total_frames - 1, 0,
                    help=f"Total frames: {total_frames}, FPS: {fps:.1f}"
                )
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Original Frame")
                    original_frame = extract_frame(str(video_path), frame_number)
                    if original_frame is not None:
                        st.image(original_frame, use_column_width=True)
                
                with col2:
                    st.subheader("Overlay Frame")
                    if overlay_path.exists():
                        overlay_frame = extract_frame(str(overlay_path), frame_number)
                        if overlay_frame is not None:
                            st.image(overlay_frame, use_column_width=True)
                    else:
                        st.info("Overlay not available. Generate overlay first.")
                
                # Frame info
                timestamp = frame_number / fps if fps > 0 else 0
                st.info(f"Frame {frame_number} at {timestamp:.2f}s")
    
    elif tab == "📋 Instructions":
        st.header("How to Use")
        
        st.markdown("""
        ## 🎯 Recording Guidelines
        
        **For best analysis results:**
        
        ### 📱 Camera Setup
        - Position camera at side angle (profile view)
        - Ensure full body is visible in frame
        - Use good lighting - avoid shadows
        - Keep camera steady (use tripod if possible)
        - Record at 30fps or higher
        
        ### 🏃 Exercise Performance
        - Perform exercises at normal speed
        - Maintain consistent form throughout
        - Ensure face is visible for identity verification
        - Complete at least 3-5 repetitions for reliable analysis
        
        ### 📹 Video Quality
        - Minimum resolution: 720p (1280x720)
        - Maximum file size: 100MB
        - Supported formats: MP4, AVI, MOV, MKV
        - Duration: 10-60 seconds recommended
        
        ## 🔍 Analysis Features
        
        ### Repetition Counting
        - Automatic detection of push-up and sit-up repetitions
        - Distinguishes between complete and partial reps
        - Provides posture quality scoring
        
        ### Integrity Verification
        - Frame duplication detection (anti-tampering)
        - Face consistency verification
        - Physiologically plausible rep rate checking
        
        ### Visual Overlays
        - MediaPipe pose landmark visualization
        - Confidence score display
        - Frame-by-frame analysis capability
        
        ## 🚀 Quick Demo
        
        1. **Upload** a video using the Upload & Analyze tab
        2. **Review** the automatic analysis results
        3. **Generate** pose overlay for visual verification
        4. **Download** CSV report for record keeping
        
        ## ⚠️ Troubleshooting
        
        **Backend Connection Issues:**
        - Ensure backend is running: `uvicorn app.main:app --reload`
        - Check backend URL in dashboard configuration
        
        **Analysis Failures:**
        - Verify video format is supported
        - Check that person is clearly visible in video
        - Ensure adequate lighting and contrast
        
        **Overlay Generation:**
        - Requires MediaPipe and OpenCV
        - May take 30-60 seconds for longer videos
        - Automatically scales down for performance
        """)


if __name__ == "__main__":
    main()