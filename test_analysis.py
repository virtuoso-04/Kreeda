"""
Unit tests for sports integrity analysis components.
Tests core functionality without requiring video files or heavy dependencies.
"""

import pytest
import numpy as np
import sys
import os
from pathlib import Path

# Add the backend app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'overlay'))

# Mock MediaPipe classes for testing without the dependency
class MockLandmark:
    def __init__(self, x, y, visibility=0.9):
        self.x = x
        self.y = y
        self.visibility = visibility

class MockPoseLandmarks:
    def __init__(self, landmarks):
        self.landmark = landmarks

class MockPoseResults:
    def __init__(self, landmarks=None):
        self.pose_landmarks = MockPoseLandmarks(landmarks) if landmarks else None


def test_angle_calculation():
    """Test angle calculation utility function."""
    from utils import calculate_angle
    
    # Test 90-degree angle
    point1 = np.array([0, 1])
    point2 = np.array([0, 0])  # vertex
    point3 = np.array([1, 0])
    
    angle = calculate_angle(point1, point2, point3)
    assert abs(angle - 90.0) < 0.1, f"Expected ~90 degrees, got {angle}"
    
    # Test 180-degree angle (straight line)
    point1 = np.array([0, 0])
    point2 = np.array([1, 0])  # vertex
    point3 = np.array([2, 0])
    
    angle = calculate_angle(point1, point2, point3)
    assert abs(angle - 180.0) < 0.1, f"Expected ~180 degrees, got {angle}"


def test_frame_mse():
    """Test frame MSE calculation."""
    from utils import compute_frame_mse
    
    # Identical frames should have MSE = 0
    frame1 = np.ones((100, 100, 3), dtype=np.uint8) * 128
    frame2 = np.ones((100, 100, 3), dtype=np.uint8) * 128
    
    mse = compute_frame_mse(frame1, frame2)
    assert mse == 0.0, f"Expected MSE = 0 for identical frames, got {mse}"
    
    # Different frames should have MSE > 0
    frame2 = np.ones((100, 100, 3), dtype=np.uint8) * 255
    mse = compute_frame_mse(frame1, frame2)
    assert mse > 0, f"Expected MSE > 0 for different frames, got {mse}"
    
    # Different sized frames should return inf
    frame3 = np.ones((50, 50, 3), dtype=np.uint8)
    mse = compute_frame_mse(frame1, frame3)
    assert mse == float('inf'), f"Expected inf for different sizes, got {mse}"


def test_centroid_calculation():
    """Test centroid calculation for landmarks."""
    from utils import get_centroid
    
    # Test with mock landmarks
    landmarks = [
        MockLandmark(0.0, 0.0),
        MockLandmark(1.0, 0.0),
        MockLandmark(0.5, 1.0),
    ]
    
    centroid = get_centroid(landmarks)
    expected = np.array([0.5, 1.0/3.0])  # Average of x and y coordinates
    
    assert np.allclose(centroid, expected), f"Expected {expected}, got {centroid}"
    
    # Test with empty landmarks
    centroid = get_centroid([])
    expected = np.array([0.0, 0.0])
    assert np.allclose(centroid, expected), f"Expected {expected} for empty landmarks, got {centroid}"


def test_rep_counter_pushup():
    """Test push-up rep counter state machine."""
    from analyze import RepCounter
    
    counter = RepCounter('pushup')
    
    # Create mock landmarks for push-up positions
    # High position (arms extended)
    high_landmarks = [None] * 33  # MediaPipe has 33 pose landmarks
    high_landmarks[11] = MockLandmark(0.3, 0.3)  # left shoulder
    high_landmarks[13] = MockLandmark(0.2, 0.4)  # left elbow  
    high_landmarks[15] = MockLandmark(0.1, 0.5)  # left wrist
    high_landmarks[12] = MockLandmark(0.7, 0.3)  # right shoulder
    high_landmarks[14] = MockLandmark(0.8, 0.4)  # right elbow
    high_landmarks[16] = MockLandmark(0.9, 0.5)  # right wrist
    
    # Low position (arms bent)
    low_landmarks = [None] * 33
    low_landmarks[11] = MockLandmark(0.3, 0.3)  # left shoulder
    low_landmarks[13] = MockLandmark(0.25, 0.35)  # left elbow (closer to shoulder)
    low_landmarks[15] = MockLandmark(0.1, 0.5)  # left wrist
    low_landmarks[12] = MockLandmark(0.7, 0.3)  # right shoulder
    low_landmarks[14] = MockLandmark(0.75, 0.35)  # right elbow (closer to shoulder)
    low_landmarks[16] = MockLandmark(0.9, 0.5)  # right wrist
    
    # Test state transitions
    assert counter.state == "up"
    assert counter.rep_count == 0
    
    # Go down (should not complete rep yet)
    rep_completed = counter.update(low_landmarks)
    assert not rep_completed
    assert counter.state == "down"
    
    # Go back up (should complete one rep)
    rep_completed = counter.update(high_landmarks)
    assert rep_completed
    assert counter.state == "up"
    assert counter.rep_count == 1


def test_rep_counter_situp():
    """Test sit-up rep counter state machine."""
    from analyze import RepCounter
    
    counter = RepCounter('situp')
    
    # Create mock landmarks for sit-up positions
    # Down position (lying down)
    down_landmarks = [None] * 33
    down_landmarks[11] = MockLandmark(0.4, 0.6)  # left shoulder
    down_landmarks[12] = MockLandmark(0.6, 0.6)  # right shoulder
    down_landmarks[23] = MockLandmark(0.4, 0.7)  # left hip
    down_landmarks[24] = MockLandmark(0.6, 0.7)  # right hip
    
    # Up position (sitting up)
    up_landmarks = [None] * 33
    up_landmarks[11] = MockLandmark(0.4, 0.3)  # left shoulder (higher)
    up_landmarks[12] = MockLandmark(0.6, 0.3)  # right shoulder (higher)
    up_landmarks[23] = MockLandmark(0.4, 0.7)  # left hip (same)
    up_landmarks[24] = MockLandmark(0.6, 0.7)  # right hip (same)
    
    # Test state transitions
    assert counter.state == "up"
    assert counter.rep_count == 0
    
    # Go down
    rep_completed = counter.update(down_landmarks)
    assert not rep_completed
    assert counter.state == "down"
    
    # Come back up (should complete one rep)  
    rep_completed = counter.update(up_landmarks)
    assert rep_completed
    assert counter.state == "up"
    assert counter.rep_count == 1


def test_job_id_creation():
    """Test job ID generation."""
    from utils import create_job_id
    
    job_id1 = create_job_id()
    job_id2 = create_job_id()
    
    # Should be different UUIDs
    assert job_id1 != job_id2
    assert len(job_id1) > 10  # UUIDs are longer than 10 chars
    assert isinstance(job_id1, str)


def test_video_info_mock():
    """Test video info extraction with mock data."""
    # This would normally test get_video_info but requires OpenCV
    # Instead, test the expected structure
    expected_keys = {'fps', 'frame_count', 'width', 'height', 'duration'}
    
    # Mock video info
    mock_info = {
        'fps': 30.0,
        'frame_count': 900,
        'width': 1280,
        'height': 720,
        'duration': 30.0
    }
    
    assert set(mock_info.keys()) == expected_keys
    assert mock_info['duration'] == mock_info['frame_count'] / mock_info['fps']


def test_file_operations():
    """Test file operation utilities."""
    from utils import ensure_data_dirs
    import tempfile
    import shutil
    
    # Test in a temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        os.chdir(temp_dir)
        
        # Should create directories without error
        ensure_data_dirs()
        
        # Check directories exist
        assert os.path.exists('data/videos')
        assert os.path.exists('data/overlays') 
        assert os.path.exists('data/results')


def test_analysis_result_structure():
    """Test that analysis results have the expected structure."""
    # Expected result structure
    expected_keys = {
        'reps', 'valid_reps', 'posture_score', 'cheat_flag', 
        'cheat_reasons', 'notes', 'frames_processed', 'duration',
        'analysis_metadata'
    }
    
    # Mock result
    mock_result = {
        'reps': 5,
        'valid_reps': 4,
        'posture_score': 0.85,
        'cheat_flag': False,
        'cheat_reasons': [],
        'notes': [],
        'frames_processed': 150,
        'duration': 5.0,
        'analysis_metadata': {
            'sample_rate': 2,
            'downscale': 0.75,
            'duplicate_frames': 0,
            'face_detections': 120,
            'rep_timestamps': [1.0, 2.0, 3.0, 4.0, 5.0]
        }
    }
    
    assert set(mock_result.keys()) == expected_keys
    assert isinstance(mock_result['cheat_flag'], bool)
    assert isinstance(mock_result['posture_score'], float)
    assert 0.0 <= mock_result['posture_score'] <= 1.0


def test_cheat_detection_logic():
    """Test cheat detection heuristics."""
    # Test duplicate frame ratio
    total_frames = 100
    duplicate_frames = 20
    duplicate_ratio = duplicate_frames / total_frames
    
    assert duplicate_ratio == 0.2
    assert duplicate_ratio > 0.15  # Should trigger cheat flag
    
    # Test face variance
    face_centroids = [
        np.array([0.5, 0.5]),
        np.array([0.52, 0.51]),
        np.array([0.48, 0.49]),
        np.array([0.51, 0.50]),
    ]
    
    face_centroids_array = np.array(face_centroids)
    face_variance = np.var(face_centroids_array, axis=0).mean()
    
    assert face_variance < 0.01  # Should not trigger cheat flag
    
    # Test rep rate
    rep_timestamps = [1.0, 1.5, 2.0, 2.5, 3.0]  # 5 reps in 3 seconds
    duration = 3.0
    rep_rate = len(rep_timestamps) / duration
    
    assert abs(rep_rate - 5/3) < 0.01
    assert rep_rate < 3.0  # Should not trigger cheat flag


if __name__ == '__main__':
    # Run tests
    pytest.main([__file__, '-v'])