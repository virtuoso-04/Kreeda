import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {db, TestRecord} from '../services/db';
import uploadService from '../services/upload';
import SimpleHeader from '../components/SimpleHeader';

type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Results'
>;

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

const ResultsScreen: React.FC<Props> = ({navigation, route}) => {
  const [localRecords, setLocalRecords] = useState<TestRecord[]>([]);
  const [backendResults, setBackendResults] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // If we have a result from navigation params, show it
    if (route.params?.result) {
      setSelectedResult(route.params.result);
    }
  }, [route.params]);

  const loadData = async () => {
    try {
      // Load local records
      const records = await db.getRecords();
      setLocalRecords(records);

      // Load backend results
      const results = await uploadService.listResults();
      setBackendResults(results);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const renderAnalysisResult = (analysis: any) => {
    if (!analysis) return null;

    return (
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>📊 Analysis Results</Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{analysis.reps || 0}</Text>
            <Text style={styles.metricLabel}>Total Reps</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{analysis.valid_reps || 0}</Text>
            <Text style={styles.metricLabel}>Valid Reps</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {((analysis.posture_score || 0) * 100).toFixed(0)}%
            </Text>
            <Text style={styles.metricLabel}>Posture Score</Text>
          </View>
        </View>

        <View style={styles.integrityContainer}>
          <Text style={styles.integrityTitle}>🔒 Integrity Check</Text>
          <View style={[
            styles.integrityStatus,
            analysis.cheat_flag ? styles.integrityFailed : styles.integrityPassed
          ]}>
            <Text style={[
              styles.integrityText,
              analysis.cheat_flag ? styles.integrityFailedText : styles.integrityPassedText
            ]}>
              {analysis.cheat_flag ? '❌ Issues Detected' : '✅ Verified'}
            </Text>
          </View>
        </View>

        {analysis.cheat_flag && analysis.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>⚠️ Issues Found:</Text>
            {analysis.notes.map((note: string, index: number) => (
              <Text key={index} style={styles.noteText}>• {note}</Text>
            ))}
          </View>
        )}

        <View style={styles.technicalInfo}>
          <Text style={styles.technicalTitle}>Technical Details</Text>
          <Text style={styles.technicalText}>
            Duration: {analysis.duration || 0}s | 
            Frames: {analysis.frames_processed || 0}
          </Text>
        </View>
      </View>
    );
  };

  const renderLocalRecord = (record: TestRecord, index: number) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>
          {record.testType === 'pushup' ? '💪' : '🏃'} {record.testType.toUpperCase()}
        </Text>
        <Text style={styles.recordDate}>
          {new Date(record.timestamp).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.recordAthlete}>Athlete: {record.athleteName}</Text>
      
      <View style={styles.recordStatus}>
        <Text style={[
          styles.statusText,
          record.synced ? styles.syncedText : styles.unsyncedText
        ]}>
          {record.synced ? '✅ Synced' : '⏳ Pending Upload'}
        </Text>
      </View>

      {record.result && (
        <TouchableOpacity
          style={styles.viewResultButton}
          onPress={() => setSelectedResult(record.result)}>
          <Text style={styles.viewResultButtonText}>View Analysis</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderBackendResult = (result: any, index: number) => (
    <View key={result.job_id || index} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>
          {result.test_type === 'pushup' ? '💪' : '🏃'} {result.test_type?.toUpperCase()}
        </Text>
        <Text style={styles.recordDate}>
          {new Date(result.timestamp * 1000).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.recordAthlete}>File: {result.filename}</Text>
      
      <View style={styles.recordStatus}>
        <Text style={styles.syncedText}>✅ Analyzed</Text>
        <Text style={[
          styles.integrityBadge,
          result.cheat_flag ? styles.integrityBadgeFailed : styles.integrityBadgePassed
        ]}>
          {result.cheat_flag ? '⚠️ Issues' : '🔒 Verified'}
        </Text>
      </View>

      <View style={styles.quickStats}>
        <Text style={styles.quickStatText}>
          Reps: {result.reps}/{result.valid_reps} | 
          Score: {(result.posture_score * 100).toFixed(0)}%
        </Text>
      </View>

      <TouchableOpacity
        style={styles.viewResultButton}
        onPress={async () => {
          // Load full result details
          const fullResult = await uploadService.getResult(result.job_id);
          if (fullResult) {
            setSelectedResult(fullResult);
          }
        }}>
        <Text style={styles.viewResultButtonText}>View Full Analysis</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SimpleHeader
        title="Analysis Results"
        subtitle="Your Performance Data"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} />
        }>
        
        {selectedResult && (
          <View style={styles.selectedResultContainer}>
            <View style={styles.selectedResultHeader}>
              <Text style={styles.selectedResultTitle}>Current Analysis</Text>
              <TouchableOpacity onPress={() => setSelectedResult(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {renderAnalysisResult(selectedResult.analysis || selectedResult)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Local Records ({localRecords.length})</Text>
          {localRecords.length > 0 ? (
            localRecords.map(renderLocalRecord)
          ) : (
            <Text style={styles.emptyText}>No local records found</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☁️ Server Results ({backendResults.length})</Text>
          {backendResults.length > 0 ? (
            backendResults.map(renderBackendResult)
          ) : (
            <Text style={styles.emptyText}>No server results found</Text>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={refreshData}>
            <Text style={styles.actionButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              const stats = await db.getStats();
              Alert.alert(
                'Storage Stats',
                `Total Records: ${stats.totalRecords}\n` +
                `Synced: ${stats.syncedRecords}\n` +
                `Pending: ${stats.unsyncedRecords}`,
              );
            }}>
            <Text style={styles.actionButtonText}>📊 Stats</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  selectedResultContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    margin: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  selectedResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    paddingHorizontal: 8,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordAthlete: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recordStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  syncedText: {
    color: '#28a745',
  },
  unsyncedText: {
    color: '#ffc107',
  },
  integrityBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  integrityBadgePassed: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  integrityBadgeFailed: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  quickStats: {
    marginBottom: 8,
  },
  quickStatText: {
    fontSize: 14,
    color: '#666',
  },
  viewResultButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  viewResultButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  integrityContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  integrityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  integrityStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  integrityPassed: {
    backgroundColor: '#d4edda',
  },
  integrityFailed: {
    backgroundColor: '#f8d7da',
  },
  integrityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  integrityPassedText: {
    color: '#155724',
  },
  integrityFailedText: {
    color: '#721c24',
  },
  notesContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  technicalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  technicalText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  actionButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultsScreen;