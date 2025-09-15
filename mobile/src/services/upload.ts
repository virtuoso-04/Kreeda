import axios, {AxiosProgressEvent} from 'axios';
import RNFS from 'react-native-fs';
import {db, TestRecord} from './db';

// Configuration - Update this for your network setup
const DEFAULT_BACKEND_URL = 'http://192.168.1.100:8000'; // Change to your local IP

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Upload result type
export interface UploadResult {
  success: boolean;
  jobId?: string;
  result?: any;
  error?: string;
}

class UploadService {
  private backendUrl: string = DEFAULT_BACKEND_URL;

  constructor() {
    this.initializeBackendUrl();
  }

  private async initializeBackendUrl() {
    try {
      this.backendUrl = await db.getBackendUrl();
    } catch (error) {
      console.warn('Failed to get backend URL from storage, using default');
      this.backendUrl = DEFAULT_BACKEND_URL;
    }
  }

  // Set backend URL
  async setBackendUrl(url: string): Promise<void> {
    this.backendUrl = url;
    await db.saveBackendUrl(url);
  }

  // Get current backend URL
  getBackendUrl(): string {
    return this.backendUrl;
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.backendUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Upload video to backend
  async uploadVideo(
    fileUri: string,
    athleteData: {name: string},
    testType: string = 'pushup',
    onProgress?: UploadProgressCallback,
  ): Promise<UploadResult> {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(fileUri);
      if (!fileExists) {
        return {
          success: false,
          error: 'Video file not found',
        };
      }

      // Get file info
      const fileInfo = await RNFS.stat(fileUri);
      console.log('Uploading file:', fileInfo.path, 'Size:', fileInfo.size);

      // Create FormData
      const formData = new FormData();
      
      formData.append('file', {
        uri: fileUri,
        type: 'video/mp4',
        name: `video_${Date.now()}.mp4`,
      } as any);
      
      formData.append('athlete', JSON.stringify(athleteData));
      formData.append('test_type', testType);

      // Upload with progress tracking
      const response = await axios.post(
        `${this.backendUrl}/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes timeout
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              onProgress(progress);
            }
          },
        },
      );

      if (response.status === 200) {
        return {
          success: true,
          jobId: response.data.job_id,
          result: response.data,
        };
      } else {
        return {
          success: false,
          error: `Upload failed with status: ${response.status}`,
        };
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Upload failed';
      if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Network error: Cannot reach server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Sync unsynced records
  async syncPendingUploads(
    onProgress?: (current: number, total: number) => void,
  ): Promise<{successful: number; failed: number}> {
    const unsyncedRecords = await db.getUnsyncedRecords();
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < unsyncedRecords.length; i++) {
      const record = unsyncedRecords[i];
      
      if (onProgress) {
        onProgress(i + 1, unsyncedRecords.length);
      }

      try {
        const result = await this.uploadVideo(
          record.filepath,
          {name: record.athleteName},
          record.testType,
        );

        if (result.success) {
          // Update record as synced
          await db.updateRecord(record.id, {
            synced: true,
            jobId: result.jobId,
            result: result.result,
          });
          successful++;
        } else {
          failed++;
          console.error(`Failed to sync record ${record.id}:`, result.error);
        }
      } catch (error) {
        failed++;
        console.error(`Error syncing record ${record.id}:`, error);
      }
    }

    return {successful, failed};
  }

  // Get result by job ID
  async getResult(jobId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.backendUrl}/result/${jobId}`, {
        timeout: 10000,
      });
      
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting result:', error);
      return null;
    }
  }

  // List all results from backend
  async listResults(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.backendUrl}/list`, {
        timeout: 10000,
      });
      
      if (response.status === 200) {
        return response.data.results || [];
      }
      return [];
    } catch (error) {
      console.error('Error listing results:', error);
      return [];
    }
  }

  // Download video file
  async downloadVideo(
    jobId: string,
    outputPath: string,
    type: 'original' | 'overlay' = 'original',
  ): Promise<boolean> {
    try {
      const endpoint = type === 'original' ? 'video' : 'overlay';
      const url = `${this.backendUrl}/${endpoint}/${jobId}`;
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: outputPath,
      }).promise;

      return downloadResult.statusCode === 200;
    } catch (error) {
      console.error('Error downloading video:', error);
      return false;
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;