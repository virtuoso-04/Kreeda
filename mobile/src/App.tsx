import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, StyleSheet} from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import TestSelectScreen from './src/screens/TestSelectScreen';
import RecordScreen from './src/screens/RecordScreen';
import ResultsScreen from './src/screens/ResultsScreen';

// Define navigation types
export type RootStackParamList = {
  Login: undefined;
  TestSelect: {athleteName: string};
  Record: {athleteName: string; testType: string};
  Results: {jobId?: string; result?: any};
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
            elevation: 2,
            shadowOpacity: 0.1,
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Sports Integrity App',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TestSelect"
          component={TestSelectScreen}
          options={{
            title: 'Select Test Type',
          }}
        />
        <Stack.Screen
          name="Record"
          component={RecordScreen}
          options={{
            title: 'Record Exercise',
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            title: 'Analysis Results',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;