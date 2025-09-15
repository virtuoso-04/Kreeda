import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for local data storage
export interface TestRecord {
  id: string;
  testType: string;
  athleteName: string;
  filepath: string;
  timestamp: number;
  synced: boolean;
  jobId?: string;
  result?: any;
}

// Keys for AsyncStorage
const STORAGE_KEYS = {
  RECORDS: 'test_records',
  ATHLETE_NAME: 'athlete_name',
  BACKEND_URL: 'backend_url',
};

class DatabaseService {
  // Save test record
  async saveRecord(record: TestRecord): Promise<void> {
    try {
      const existingRecords = await this.getRecords();
      const updatedRecords = [...existingRecords, record];
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECORDS,
        JSON.stringify(updatedRecords),
      );
    } catch (error) {
      console.error('Error saving record:', error);
      throw error;
    }
  }

  // Get all records
  async getRecords(): Promise<TestRecord[]> {
    try {
      const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
      return recordsJson ? JSON.parse(recordsJson) : [];
    } catch (error) {
      console.error('Error getting records:', error);
      return [];
    }
  }

  // Update record
  async updateRecord(id: string, updates: Partial<TestRecord>): Promise<void> {
    try {
      const records = await this.getRecords();
      const updatedRecords = records.map(record =>
        record.id === id ? {...record, ...updates} : record,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECORDS,
        JSON.stringify(updatedRecords),
      );
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }

  // Get unsynced records
  async getUnsyncedRecords(): Promise<TestRecord[]> {
    try {
      const records = await this.getRecords();
      return records.filter(record => !record.synced);
    } catch (error) {
      console.error('Error getting unsynced records:', error);
      return [];
    }
  }

  // Save athlete name
  async saveAthleteName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ATHLETE_NAME, name);
    } catch (error) {
      console.error('Error saving athlete name:', error);
      throw error;
    }
  }

  // Get athlete name
  async getAthleteName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ATHLETE_NAME);
    } catch (error) {
      console.error('Error getting athlete name:', error);
      return null;
    }
  }

  // Save backend URL
  async saveBackendUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BACKEND_URL, url);
    } catch (error) {
      console.error('Error saving backend URL:', error);
      throw error;
    }
  }

  // Get backend URL
  async getBackendUrl(): Promise<string> {
    try {
      const url = await AsyncStorage.getItem(STORAGE_KEYS.BACKEND_URL);
      return url || 'http://192.168.1.100:8000'; // Default local IP
    } catch (error) {
      console.error('Error getting backend URL:', error);
      return 'http://192.168.1.100:8000';
    }
  }

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.RECORDS,
        STORAGE_KEYS.ATHLETE_NAME,
        STORAGE_KEYS.BACKEND_URL,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Get storage stats
  async getStats(): Promise<{
    totalRecords: number;
    syncedRecords: number;
    unsyncedRecords: number;
  }> {
    try {
      const records = await this.getRecords();
      const syncedCount = records.filter(r => r.synced).length;
      
      return {
        totalRecords: records.length,
        syncedRecords: syncedCount,
        unsyncedRecords: records.length - syncedCount,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {totalRecords: 0, syncedRecords: 0, unsyncedRecords: 0};
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();
export default db;