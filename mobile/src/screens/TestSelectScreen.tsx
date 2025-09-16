import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import SimpleHeader from '../components/SimpleHeader';

type TestSelectScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TestSelect'
>;

type TestSelectScreenRouteProp = RouteProp<RootStackParamList, 'TestSelect'>;

interface Props {
  navigation: TestSelectScreenNavigationProp;
  route: TestSelectScreenRouteProp;
}

const TestSelectScreen: React.FC<Props> = ({navigation, route}) => {
  const {athleteName} = route.params;

  const handleTestSelect = (testType: string) => {
    navigation.navigate('Record', {
      athleteName,
      testType,
    });
  };

  const showTestInfo = (testType: string) => {
    const info = testType === 'pushup' 
      ? {
          title: 'Push-up Test',
          description: 'Record yourself doing push-ups from a side angle.\n\n' +
            '• Position camera to show your full body profile\n' +
            '• Ensure good lighting with minimal shadows\n' +
            '• Maintain steady camera position\n' +
            '• Perform 5-10 repetitions at normal speed\n' +
            '• Keep your face visible for verification',
        }
      : {
          title: 'Sit-up Test', 
          description: 'Record yourself doing sit-ups from a side angle.\n\n' +
            '• Position camera to show your full body profile\n' +
            '• Ensure good lighting with minimal shadows\n' +
            '• Keep legs bent at knees (traditional sit-up position)\n' +
            '• Perform 5-10 repetitions at normal speed\n' +
            '• Keep your face visible for verification',
        };

    Alert.alert(info.title, info.description, [{text: 'Got it!'}]);
  };

  return (
    <View style={styles.container}>
      <SimpleHeader 
        title={`Welcome, ${athleteName}`}
        subtitle="Select Exercise Type"
      />

      <View style={styles.content}>
        <Text style={styles.instructions}>
          Choose the exercise you want to record and analyze:
        </Text>

        <View style={styles.testContainer}>
          <TouchableOpacity
            style={styles.testCard}
            onPress={() => handleTestSelect('pushup')}>
            <Text style={styles.testEmoji}>💪</Text>
            <Text style={styles.testTitle}>Push-ups</Text>
            <Text style={styles.testDescription}>
              Upper body strength test with form analysis
            </Text>
            
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => showTestInfo('pushup')}>
              <Text style={styles.infoButtonText}>ℹ️ Recording Tips</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testCard}
            onPress={() => handleTestSelect('situp')}>
            <Text style={styles.testEmoji}>🏃</Text>
            <Text style={styles.testTitle}>Sit-ups</Text>
            <Text style={styles.testDescription}>
              Core strength test with form analysis
            </Text>
            
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => showTestInfo('situp')}>
              <Text style={styles.infoButtonText}>ℹ️ Recording Tips</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎯 AI will analyze your form, count repetitions, and verify integrity
          </Text>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  instructions: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  testContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  testCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TestSelectScreen;