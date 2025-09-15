"""
Video analysis module using MediaPipe Pose for sports integrity checking.
Implements rep counting and cheat detection for push-ups and sit-ups.
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, Any, List, Optional, Tuple
import math
from utils import calculate_angle, compute_frame_mse, get_centroid

# MediaPipe pose initialization
mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh

# Configuration constants
SAMPLE_RATE = 2  # Process every Nth frame
DOWNSCALE = 0.75  # Scale down frames for faster processing
MSE_THRESHOLD = 100.0  # Frame duplication detection threshold
FACE_CENTROID_VARIANCE_THRESHOLD = 0.01  # Face consistency threshold
REP_RATE_THRESHOLD = 3.0  # Max reps per second (physiological limit)

# Exercise-specific thresholds
PUSHUP_ANGLE_THRESHOLD = 90.0  # Elbow angle for push-up down position
SITUP_TORSO_THRESHOLD = 0.15  # Torso vertical displacement threshold


class RepCounter:
    """State machine for counting repetitions."""
    
    def __init__(self, exercise_type: str):
        self.exercise_type = exercise_type.lower()
        self.state = "up"  # "up" or "down"
        self.rep_count = 0
        self.valid_reps = 0
        self.last_angles = []
        self.posture_scores = []
        
    def update(self, landmarks) -> bool:
        """Update state and return True if a rep was completed."""
        if self.exercise_type == "pushup":
            return self._update_pushup(landmarks)
        elif self.exercise_type == "situp":
            return self._update_situp(landmarks)
        return False
    
    def _update_pushup(self, landmarks) -> bool:
        """Update push-up counter based on elbow angle."""
        if not landmarks:
            return False
            
        try:
            # Get key landmarks for push-up analysis
            left_shoulder = np.array([landmarks[11].x, landmarks[11].y])
            left_elbow = np.array([landmarks[13].x, landmarks[13].y])
            left_wrist = np.array([landmarks[15].x, landmarks[15].y])
            
            right_shoulder = np.array([landmarks[12].x, landmarks[12].y])
            right_elbow = np.array([landmarks[14].x, landmarks[14].y])
            right_wrist = np.array([landmarks[16].x, landmarks[16].y])
            
            # Calculate elbow angles
            left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
            avg_angle = (left_angle + right_angle) / 2
            
            self.last_angles.append(avg_angle)
            if len(self.last_angles) > 10:
                self.last_angles.pop(0)
            
            # Calculate posture score (how close to ideal form)
            ideal_angle_down = 80.0
            ideal_angle_up = 160.0
            
            if self.state == "down":
                deviation = abs(avg_angle - ideal_angle_down) / ideal_angle_down
            else:
                deviation = abs(avg_angle - ideal_angle_up) / ideal_angle_up
                
            posture_score = max(0.0, 1.0 - deviation)
            self.posture_scores.append(posture_score)
            
            # State machine logic
            rep_completed = False
            if self.state == "up" and avg_angle < PUSHUP_ANGLE_THRESHOLD:
                self.state = "down"
            elif self.state == "down" and avg_angle > PUSHUP_ANGLE_THRESHOLD + 20:
                self.state = "up"
                self.rep_count += 1
                
                # Validate rep quality
                if posture_score > 0.6:  # Minimum posture threshold
                    self.valid_reps += 1
                    
                rep_completed = True
                
            return rep_completed
            
        except (IndexError, AttributeError):
            return False
    
    def _update_situp(self, landmarks) -> bool:
        """Update sit-up counter based on torso angle."""
        if not landmarks:
            return False
            
        try:
            # Get key landmarks for sit-up analysis
            left_shoulder = np.array([landmarks[11].x, landmarks[11].y])
            right_shoulder = np.array([landmarks[12].x, landmarks[12].y])
            left_hip = np.array([landmarks[23].x, landmarks[23].y])
            right_hip = np.array([landmarks[24].x, landmarks[24].y])
            
            # Calculate torso midpoints
            shoulder_mid = (left_shoulder + right_shoulder) / 2
            hip_mid = (left_hip + right_hip) / 2
            
            # Calculate torso vertical displacement
            torso_vector = shoulder_mid - hip_mid
            vertical_component = abs(torso_vector[1])
            
            # Calculate posture score based on spine alignment
            spine_straightness = 1.0 - abs(torso_vector[0]) / max(abs(torso_vector[1]), 0.1)
            posture_score = max(0.0, min(1.0, spine_straightness))
            self.posture_scores.append(posture_score)
            
            # State machine logic
            rep_completed = False
            if self.state == "down" and vertical_component < SITUP_TORSO_THRESHOLD:
                self.state = "up"
                self.rep_count += 1
                
                # Validate rep quality
                if posture_score > 0.5:
                    self.valid_reps += 1
                    
                rep_completed = True
            elif self.state == "up" and vertical_component > SITUP_TORSO_THRESHOLD + 0.05:
                self.state = "down"
                
            return rep_completed
            
        except (IndexError, AttributeError):
            return False
    
    def get_average_posture_score(self) -> float:
        """Get average posture score."""
        if not self.posture_scores:
            return 0.0
        return sum(self.posture_scores) / len(self.posture_scores)


def analyze_video(video_path: str, test_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze video for sports integrity using MediaPipe Pose.
    
    Args:
        video_path: Path to video file
        test_type: Type of exercise ('pushup' or 'situp')
        
    Returns:
        Analysis results dictionary
    """
    
    # Initialize MediaPipe
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": "Could not open video file"}
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    
    # Initialize analysis components
    if test_type:
        rep_counter = RepCounter(test_type)
    else:
        rep_counter = RepCounter("pushup")  # Default
    
    # Cheat detection variables
    previous_frame = None
    duplicate_frames = 0
    face_centroids = []
    rep_timestamps = []
    
    frames_processed = 0
    frame_index = 0
    notes = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_index += 1
        
        # Sample frames to speed up processing
        if frame_index % SAMPLE_RATE != 0:
            continue
            
        frames_processed += 1
        current_time = frame_index / fps
        
        # Downscale frame for faster processing
        if DOWNSCALE != 1.0:
            height, width = frame.shape[:2]
            new_width = int(width * DOWNSCALE)
            new_height = int(height * DOWNSCALE)
            frame = cv2.resize(frame, (new_width, new_height))
        
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Frame duplication detection
        if previous_frame is not None:
            mse = compute_frame_mse(frame, previous_frame)
            if mse < MSE_THRESHOLD:
                duplicate_frames += 1
        previous_frame = frame.copy()
        
        # Pose detection
        pose_results = pose.process(rgb_frame)
        
        if pose_results.pose_landmarks:
            landmarks = pose_results.pose_landmarks.landmark
            
            # Update rep counter
            if rep_counter.update(landmarks):
                rep_timestamps.append(current_time)
        
        # Face detection for consistency check
        face_results = face_mesh.process(rgb_frame)
        if face_results.multi_face_landmarks:
            for face_landmarks in face_results.multi_face_landmarks:
                centroid = get_centroid(face_landmarks.landmark)
                face_centroids.append(centroid)
    
    cap.release()
    pose.close()
    face_mesh.close()
    
    # Calculate cheat detection metrics
    cheat_flags = []
    
    # 1. Frame duplication check
    duplicate_ratio = duplicate_frames / max(frames_processed, 1)
    if duplicate_ratio > 0.15:  # More than 15% duplicate frames
        cheat_flags.append("excessive_frame_duplication")
        notes.append(f"High frame duplication detected: {duplicate_ratio:.2%}")
    
    # 2. Face consistency check
    if len(face_centroids) > 5:
        face_centroids_array = np.array(face_centroids)
        face_variance = np.var(face_centroids_array, axis=0).mean()
        if face_variance > FACE_CENTROID_VARIANCE_THRESHOLD:
            cheat_flags.append("face_inconsistency")
            notes.append(f"Face position inconsistency detected: {face_variance:.4f}")
    
    # 3. Unphysiological rep rate check
    if len(rep_timestamps) > 1 and duration > 0:
        rep_rate = len(rep_timestamps) / duration
        if rep_rate > REP_RATE_THRESHOLD:
            cheat_flags.append("excessive_rep_rate")
            notes.append(f"Unphysiological rep rate: {rep_rate:.2f} reps/sec")
    
    # Compile results
    result = {
        "reps": rep_counter.rep_count,
        "valid_reps": rep_counter.valid_reps,
        "posture_score": round(rep_counter.get_average_posture_score(), 3),
        "cheat_flag": len(cheat_flags) > 0,
        "cheat_reasons": cheat_flags,
        "notes": notes,
        "frames_processed": frames_processed,
        "duration": round(duration, 2),
        "analysis_metadata": {
            "sample_rate": SAMPLE_RATE,
            "downscale": DOWNSCALE,
            "duplicate_frames": duplicate_frames,
            "face_detections": len(face_centroids),
            "rep_timestamps": rep_timestamps
        }
    }
    
    return result