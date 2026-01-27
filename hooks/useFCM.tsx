import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { initializeFirebase } from '../config/firebase';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {

        await initializeFirebase();

        // 1. Request Permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return;
          }
        } else {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (!enabled) {
            console.log('Notification permission denied');
            return;
          }
        }

        console.log("permission granted, moving to getting token");

        // 2. Get Token
        const token = await messaging().getToken();
        console.log('FCM Token Generated:', token);
        setFcmToken(token);
      } catch (error) {
        console.error('Failed to get FCM token:', error);
      }
    };

    getToken();
  }, []);

  return { fcmToken };
};
