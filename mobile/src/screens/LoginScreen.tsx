import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {db} from '../services/db';
import uploadService from '../services/upload';
import SimpleHeader from '../components/SimpleHeader';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [athleteName, setAthleteName] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedName = await db.getAthleteName();
      const storedUrl = await db.getBackendUrl();
      
      if (storedName) {
        setAthleteName(storedName);
      }
      setBackendUrl(storedUrl);
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const handleLogin = async () => {
    if (!athleteName.trim()) {
      Alert.alert('Error', 'Please enter athlete name');
      return;
    }

    setIsLoading(true);

    try {
      // Save athlete name
      await db.saveAthleteName(athleteName.trim());

      // Update backend URL if changed
      if (backendUrl.trim()) {
        await uploadService.setBackendUrl(backendUrl.trim());
      }

      // Test backend connection
      const connected = await uploadService.testConnection();
      if (!connected) {
        Alert.alert(
          'Connection Warning',
          'Cannot connect to backend server. You can still record videos locally and sync later.',
          [
            {text: 'Continue Offline', onPress: () => proceedToNextScreen()},
            {text: 'Check Settings', style: 'cancel'},
          ],
        );
        setIsLoading(false);
        return;
      }

      proceedToNextScreen();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToNextScreen = () => {
    navigation.navigate('TestSelect', {athleteName: athleteName.trim()});
  };

  const showNetworkHelp = () => {
    Alert.alert(
      'Backend URL Help',
      'Enter the IP address of your computer running the backend server.\n\n' +
        'Example: http://192.168.1.100:8000\n\n' +
        'Make sure your phone and computer are on the same WiFi network.\n\n' +
        'To find your computer\'s IP:\n' +
        '• Windows: ipconfig\n' +
        '• Mac/Linux: ifconfig or ip addr',
      [{text: 'OK'}],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SimpleHeader
        title="Sports Integrity"
        subtitle="AI-Powered Exercise Analysis"
      />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🏃‍♂️</Text>
          <Text style={styles.logoText}>SI Analytics</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Athlete Name</Text>
          <TextInput
            style={styles.input}
            value={athleteName}
            onChangeText={setAthleteName}
            placeholder="Enter your name"
            autoCapitalize="words"
            autoComplete="name"
          />

          <View style={styles.urlContainer}>
            <Text style={styles.label}>Backend Server URL</Text>
            <TouchableOpacity onPress={showNetworkHelp}>
              <Text style={styles.helpLink}>Need help? 📡</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="http://192.168.1.100:8000"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Connecting...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Record exercises with AI-powered integrity verification
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  urlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpLink: {
    color: '#2196F3',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;