/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Initialize Firebase before using messaging
import { initializeFirebase } from './config/firebase';

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Ensure firebase is initialized
  await initializeFirebase();
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
