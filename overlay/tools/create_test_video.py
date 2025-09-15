"""
Test video creation utility for generating synthetic workout videos.
Creates simple animations that can be used for testing the analysis pipeline.
"""

import cv2
import numpy as np
import math
import argparse
from pathlib import Path


def create_pushup_animation(output_path: str, duration: float = 3.0, fps: int = 30):
    """
    Create a synthetic push-up animation with a moving stick figure.
    
    Args:
        output_path: Path where to save the video
        duration: Duration in seconds
        fps: Frames per second
    """
    
    width, height = 640, 480
    total_frames = int(duration * fps)
    
    # Video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Animation parameters
    center_x, center_y = width // 2, height // 2
    pushup_cycles = 2  # Number of push-ups in the video
    
    for frame_idx in range(total_frames):
        # Create blank frame
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Calculate push-up phase (0 = up, 1 = down)
        cycle_progress = (frame_idx / total_frames) * pushup_cycles
        pushup_phase = math.sin(cycle_progress * 2 * math.pi) * 0.5 + 0.5
        
        # Body positions (stick figure)
        body_offset = int(pushup_phase * 30)  # Vertical movement
        
        # Head
        head_center = (center_x, center_y - 100 + body_offset)
        cv2.circle(frame, head_center, 20, (255, 255, 255), 2)
        
        # Body (torso)
        torso_top = (center_x, center_y - 80 + body_offset)
        torso_bottom = (center_x, center_y + 40 + body_offset)
        cv2.line(frame, torso_top, torso_bottom, (255, 255, 255), 3)
        
        # Arms (varying angle for push-up motion)
        arm_angle = pushup_phase * 45 + 15  # 15-60 degrees
        arm_length = 50
        
        # Left arm
        left_shoulder = torso_top
        left_elbow_x = int(left_shoulder[0] - arm_length * math.cos(math.radians(arm_angle)))
        left_elbow_y = int(left_shoulder[1] + arm_length * math.sin(math.radians(arm_angle)))
        left_elbow = (left_elbow_x, left_elbow_y)
        
        left_hand_x = int(left_elbow[0] - arm_length * math.cos(math.radians(arm_angle * 0.8)))
        left_hand_y = int(left_elbow[1] + arm_length * math.sin(math.radians(arm_angle * 0.8)))
        left_hand = (left_hand_x, left_hand_y)
        
        cv2.line(frame, left_shoulder, left_elbow, (255, 255, 255), 3)
        cv2.line(frame, left_elbow, left_hand, (255, 255, 255), 3)
        
        # Right arm
        right_elbow_x = int(left_shoulder[0] + arm_length * math.cos(math.radians(arm_angle)))
        right_elbow_y = left_elbow_y
        right_elbow = (right_elbow_x, right_elbow_y)
        
        right_hand_x = int(right_elbow[0] + arm_length * math.cos(math.radians(arm_angle * 0.8)))
        right_hand_y = left_hand_y
        right_hand = (right_hand_x, right_hand_y)
        
        cv2.line(frame, left_shoulder, right_elbow, (255, 255, 255), 3)
        cv2.line(frame, right_elbow, right_hand, (255, 255, 255), 3)
        
        # Legs
        left_hip = (center_x - 10, torso_bottom[1])
        right_hip = (center_x + 10, torso_bottom[1])
        
        left_knee = (center_x - 15, center_y + 80 + body_offset // 2)
        right_knee = (center_x + 15, center_y + 80 + body_offset // 2)
        
        left_foot = (center_x - 20, center_y + 120 + body_offset // 2)
        right_foot = (center_x + 20, center_y + 120 + body_offset // 2)
        
        cv2.line(frame, left_hip, left_knee, (255, 255, 255), 3)
        cv2.line(frame, left_knee, left_foot, (255, 255, 255), 3)
        cv2.line(frame, right_hip, right_knee, (255, 255, 255), 3)
        cv2.line(frame, right_knee, right_foot, (255, 255, 255), 3)
        
        # Add frame counter for testing
        cv2.putText(frame, f"Frame: {frame_idx}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Add push-up counter
        completed_reps = int(cycle_progress)
        cv2.putText(frame, f"Reps: {completed_reps}", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    print(f"Created push-up test video: {output_path}")


def create_tampered_video(output_path: str, duration: float = 3.0, fps: int = 30):
    """
    Create a tampered video with duplicated frames for cheat detection testing.
    
    Args:
        output_path: Path where to save the video
        duration: Duration in seconds
        fps: Frames per second
    """
    
    width, height = 640, 480
    total_frames = int(duration * fps)
    
    # Video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Create a simple animation with intentional duplications
    for frame_idx in range(total_frames):
        # Create blank frame
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Add some movement (circle bouncing)
        if frame_idx < total_frames * 0.3:
            # Normal movement for first 30%
            x = int((frame_idx / (total_frames * 0.3)) * width)
            y = height // 2
        elif frame_idx < total_frames * 0.7:
            # Duplicate frames for middle 40% (cheat detection trigger)
            x = int(0.3 * width)
            y = height // 2
        else:
            # Resume movement for last 30%
            progress = (frame_idx - total_frames * 0.7) / (total_frames * 0.3)
            x = int(0.3 * width + progress * 0.7 * width)
            y = height // 2
        
        # Draw moving circle
        cv2.circle(frame, (x, y), 30, (0, 255, 0), -1)
        
        # Add warning text during duplicate section
        if total_frames * 0.3 <= frame_idx < total_frames * 0.7:
            cv2.putText(frame, "DUPLICATE FRAMES", (200, 100), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        cv2.putText(frame, f"Frame: {frame_idx}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    print(f"Created tampered test video: {output_path}")


def create_situp_animation(output_path: str, duration: float = 4.0, fps: int = 30):
    """
    Create a synthetic sit-up animation.
    
    Args:
        output_path: Path where to save the video
        duration: Duration in seconds
        fps: Frames per second
    """
    
    width, height = 640, 480
    total_frames = int(duration * fps)
    
    # Video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    center_x, center_y = width // 2, height // 2 + 50
    situp_cycles = 2.5
    
    for frame_idx in range(total_frames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Calculate sit-up phase
        cycle_progress = (frame_idx / total_frames) * situp_cycles
        situp_phase = math.sin(cycle_progress * 2 * math.pi) * 0.5 + 0.5
        
        # Torso angle (0 = lying down, 1 = sitting up)
        torso_angle = situp_phase * 60  # 0-60 degrees
        torso_length = 80
        
        # Base position (hips)
        hip_pos = (center_x, center_y)
        
        # Torso position
        torso_end_x = int(hip_pos[0] - torso_length * math.sin(math.radians(torso_angle)))
        torso_end_y = int(hip_pos[1] - torso_length * math.cos(math.radians(torso_angle)))
        torso_end = (torso_end_x, torso_end_y)
        
        # Head
        head_x = int(torso_end[0] - 25 * math.sin(math.radians(torso_angle)))
        head_y = int(torso_end[1] - 25 * math.cos(math.radians(torso_angle)))
        head_pos = (head_x, head_y)
        
        # Draw stick figure
        cv2.circle(frame, head_pos, 15, (255, 255, 255), 2)  # Head
        cv2.line(frame, hip_pos, torso_end, (255, 255, 255), 3)  # Torso
        
        # Arms
        arm_length = 40
        left_arm_end = (torso_end[0] - arm_length, torso_end[1] + 10)
        right_arm_end = (torso_end[0] + arm_length, torso_end[1] + 10)
        cv2.line(frame, torso_end, left_arm_end, (255, 255, 255), 2)
        cv2.line(frame, torso_end, right_arm_end, (255, 255, 255), 2)
        
        # Legs (fixed position)
        left_knee = (center_x - 30, center_y + 60)
        right_knee = (center_x + 30, center_y + 60)
        left_foot = (center_x - 35, center_y + 100)
        right_foot = (center_x + 35, center_y + 100)
        
        cv2.line(frame, (center_x - 10, center_y), left_knee, (255, 255, 255), 3)
        cv2.line(frame, (center_x + 10, center_y), right_knee, (255, 255, 255), 3)
        cv2.line(frame, left_knee, left_foot, (255, 255, 255), 3)
        cv2.line(frame, right_knee, right_foot, (255, 255, 255), 3)
        
        # Add counters
        cv2.putText(frame, f"Frame: {frame_idx}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        completed_reps = int(cycle_progress)
        cv2.putText(frame, f"Sit-ups: {completed_reps}", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    print(f"Created sit-up test video: {output_path}")


def main():
    """CLI interface for creating test videos."""
    parser = argparse.ArgumentParser(description="Create test videos for sports analysis")
    parser.add_argument("--type", choices=["pushup", "situp", "tampered"], 
                       default="pushup", help="Type of test video to create")
    parser.add_argument("--output", "-o", default="test_video.mp4", 
                       help="Output video file path")
    parser.add_argument("--duration", "-d", type=float, default=3.0,
                       help="Video duration in seconds")
    parser.add_argument("--fps", type=int, default=30,
                       help="Frames per second")
    
    args = parser.parse_args()
    
    # Ensure output directory exists
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create the requested video type
    if args.type == "pushup":
        create_pushup_animation(str(output_path), args.duration, args.fps)
    elif args.type == "situp":
        create_situp_animation(str(output_path), args.duration, args.fps)
    elif args.type == "tampered":
        create_tampered_video(str(output_path), args.duration, args.fps)
    
    print(f"Test video created successfully: {output_path}")
    print(f"Duration: {args.duration}s, FPS: {args.fps}, Type: {args.type}")


if __name__ == "__main__":
    main()