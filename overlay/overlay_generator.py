"""
Overlay generator for sports analysis videos.
Creates pose landmark overlays on video frames using MediaPipe.
"""

import cv2
import numpy as np
import mediapipe as mp
import json
import argparse
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional


# MediaPipe drawing utilities
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Configuration
DEFAULT_SAMPLE_RATE = 1
DEFAULT_SCALE = 1.0
LANDMARK_CONFIDENCE_THRESHOLD = 0.5


def generate_overlay(
    input_path: str, 
    output_path: str, 
    sample_rate: int = DEFAULT_SAMPLE_RATE,
    scale: float = DEFAULT_SCALE,
    show_confidence: bool = True
) -> Dict[str, Any]:
    """
    Generate pose overlay video with MediaPipe landmarks.
    
    Args:
        input_path: Path to input video
        output_path: Path to save overlay video
        sample_rate: Process every Nth frame (1 = all frames)
        scale: Scale factor for processing (1.0 = original size)
        show_confidence: Whether to show confidence scores
        
    Returns:
        Dictionary with overlay generation metadata
    """
    
    # Initialize MediaPipe Pose
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Open input video
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {input_path}")
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Calculate output dimensions
    out_width = int(width * scale)
    out_height = int(height * scale)
    
    # Setup video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (out_width, out_height))
    
    # Processing metrics
    processed_frames = 0
    landmark_detections = 0
    confidence_scores = []
    
    frame_idx = 0
    
    print(f"Processing video: {input_path}")
    print(f"Output: {output_path}")
    print(f"Original: {width}x{height} @ {fps}fps, {total_frames} frames")
    print(f"Output: {out_width}x{out_height}, sample_rate={sample_rate}")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_idx += 1
        
        # Sample frames
        if frame_idx % sample_rate != 0:
            # For non-processed frames, just resize and write
            if scale != 1.0:
                frame = cv2.resize(frame, (out_width, out_height))
            out.write(frame)
            continue
        
        processed_frames += 1
        
        # Resize frame if needed
        if scale != 1.0:
            frame = cv2.resize(frame, (out_width, out_height))
        
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process pose
        results = pose.process(rgb_frame)
        
        # Draw pose landmarks
        overlay_frame = frame.copy()
        
        if results.pose_landmarks:
            landmark_detections += 1
            
            # Calculate average landmark confidence
            landmark_confidences = [
                lm.visibility for lm in results.pose_landmarks.landmark
                if hasattr(lm, 'visibility')
            ]
            if landmark_confidences:
                avg_confidence = sum(landmark_confidences) / len(landmark_confidences)
                confidence_scores.append(avg_confidence)
            
            # Draw pose landmarks
            mp_drawing.draw_landmarks(
                overlay_frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
            )
            
            # Add confidence text if requested
            if show_confidence and landmark_confidences:
                conf_text = f"Confidence: {avg_confidence:.2f}"
                cv2.putText(overlay_frame, conf_text, (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Add frame info
        frame_info = f"Frame: {frame_idx}/{total_frames}"
        cv2.putText(overlay_frame, frame_info, (10, out_height - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        out.write(overlay_frame)
        
        # Progress indicator
        if processed_frames % 30 == 0:
            progress = (frame_idx / total_frames) * 100
            print(f"Progress: {progress:.1f}% ({frame_idx}/{total_frames} frames)")
    
    # Cleanup
    cap.release()
    out.release()
    pose.close()
    
    # Calculate summary statistics
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
    detection_rate = landmark_detections / processed_frames if processed_frames > 0 else 0.0
    
    metadata = {
        "input_path": input_path,
        "output_path": output_path,
        "processing_params": {
            "sample_rate": sample_rate,
            "scale": scale,
            "show_confidence": show_confidence
        },
        "video_info": {
            "fps": fps,
            "original_dimensions": [width, height],
            "output_dimensions": [out_width, out_height],
            "total_frames": total_frames,
            "duration": total_frames / fps if fps > 0 else 0
        },
        "analysis_results": {
            "processed_frames": processed_frames,
            "landmark_detections": landmark_detections,
            "detection_rate": detection_rate,
            "average_confidence": avg_confidence,
            "confidence_scores": confidence_scores[-100:]  # Keep last 100 for size
        }
    }
    
    # Save metadata JSON
    metadata_path = output_path.replace('.mp4', '_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nOverlay generation completed!")
    print(f"Processed {processed_frames} frames")
    print(f"Landmark detection rate: {detection_rate:.2%}")
    print(f"Average confidence: {avg_confidence:.3f}")
    print(f"Metadata saved: {metadata_path}")
    
    return metadata


def batch_generate_overlays(
    input_dir: str,
    output_dir: str,
    file_pattern: str = "*.mp4",
    **kwargs
) -> List[Dict[str, Any]]:
    """
    Generate overlays for multiple videos in a directory.
    
    Args:
        input_dir: Directory containing input videos
        output_dir: Directory to save overlay videos
        file_pattern: Glob pattern for input files
        **kwargs: Additional arguments for generate_overlay
        
    Returns:
        List of metadata dictionaries for each processed video
    """
    
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    input_files = list(input_path.glob(file_pattern))
    if not input_files:
        print(f"No files found matching {file_pattern} in {input_dir}")
        return []
    
    results = []
    
    for i, input_file in enumerate(input_files, 1):
        print(f"\n[{i}/{len(input_files)}] Processing: {input_file.name}")
        
        output_file = output_path / f"{input_file.stem}_overlay.mp4"
        
        try:
            metadata = generate_overlay(
                str(input_file),
                str(output_file),
                **kwargs
            )
            results.append(metadata)
        except Exception as e:
            print(f"Error processing {input_file}: {e}")
            continue
    
    print(f"\nBatch processing completed: {len(results)}/{len(input_files)} successful")
    return results


def main():
    """CLI interface for overlay generation."""
    parser = argparse.ArgumentParser(description="Generate pose overlay videos")
    parser.add_argument("input", help="Input video file or directory")
    parser.add_argument("output", help="Output video file or directory")
    parser.add_argument("--sample-rate", type=int, default=DEFAULT_SAMPLE_RATE,
                       help="Process every Nth frame (default: 1)")
    parser.add_argument("--scale", type=float, default=DEFAULT_SCALE,
                       help="Scale factor for processing (default: 1.0)")
    parser.add_argument("--no-confidence", action="store_true",
                       help="Don't show confidence scores on overlay")
    parser.add_argument("--batch", action="store_true",
                       help="Process all videos in input directory")
    parser.add_argument("--pattern", default="*.mp4",
                       help="File pattern for batch processing (default: *.mp4)")
    
    args = parser.parse_args()
    
    try:
        if args.batch:
            # Batch processing
            results = batch_generate_overlays(
                args.input,
                args.output,
                args.pattern,
                sample_rate=args.sample_rate,
                scale=args.scale,
                show_confidence=not args.no_confidence
            )
            
            # Save batch summary
            summary_path = Path(args.output) / "batch_summary.json"
            with open(summary_path, 'w') as f:
                json.dump({
                    "processed_count": len(results),
                    "results": results
                }, f, indent=2)
            
            print(f"Batch summary saved: {summary_path}")
            
        else:
            # Single file processing
            metadata = generate_overlay(
                args.input,
                args.output,
                sample_rate=args.sample_rate,
                scale=args.scale,
                show_confidence=not args.no_confidence
            )
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()