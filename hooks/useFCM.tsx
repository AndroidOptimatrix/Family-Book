// hooks/useFCM.js - Updated version
import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { initializeFirebase } from '../config/firebase';
import { makeApiCall } from '../utils/http-helper';
import { 
  getStoredFCMToken, 
  setStoredFCMToken, 
  getStoredUserId,
  setStoredUserId 
} from '../utils/storage';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Function to send token to backend (GET method)
  const sendTokenToBackend = async (token: string, userId: string) => {
    try {
      if (!token || !userId) {
        console.log('Missing token or userId');
        return false;
      }

      console.log('Sending FCM token to backend:', token.substring(0, 30) + '...');
      
      const params = {
        type: 'update_device_token',
        user_id: userId,
        device_token: token,
        platform: Platform.OS
      };

      const data = await makeApiCall('', params);
      
      if (data.DATA && data.DATA.length > 0) {
        const firstItem = data.DATA[0];
        if (firstItem.result === 'success') {
          console.log('✅ Device token updated successfully in backend');
          return true;
        } else {
          console.error('❌ Failed to update device token:', firstItem.msg);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error sending token to backend:', error);
      return false;
    }
  };

  // Function to get and store FCM token
  const getFCMToken = async () => {
    try {
      await initializeFirebase();

      // 1. Request Permission
      let hasPermission = false;
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const authStatus = await messaging().requestPermission();
        hasPermission = 
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      }

      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      console.log("Permission granted, moving to getting token");

      // 2. Get Token
      const token = await messaging().getToken();
      console.log('FCM Token Generated:', token.substring(0, 30) + '...');
      
      // 3. Save token using our storage helper
      await setStoredFCMToken(token);
      setFcmToken(token);
      
      // 4. Check if we have userId and send token immediately if available
      const userId = await getStoredUserId();
      if (userId) {
        console.log('User ID found, sending token to backend...');
        await sendTokenToBackend(token, userId);
      } else {
        console.log('No user ID found, token saved locally only');
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  };

  // Function to get saved token from storage
  const getSavedToken = async () => {
    return await getStoredFCMToken();
  };

  // Function to manually send token when user logs in
  const updateDeviceToken = async (userId:string) => {
    try {
      const token = await getSavedToken();
      if (!token) {
        // If no saved token, get a new one
        const newToken = await getFCMToken();
        if (newToken) {
          return await sendTokenToBackend(newToken, userId);
        }
        return false;
      }
      
      return await sendTokenToBackend(token, userId);
    } catch (error) {
      console.error('Error updating device token:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial token
    getFCMToken();
    
    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM token refreshed:', newToken.substring(0, 30) + '...');
      
      // Save new token
      await setStoredFCMToken(newToken);
      setFcmToken(newToken);
      
      // Update backend if we have userId
      const userId = await getStoredUserId();
      if (userId) {
        await sendTokenToBackend(newToken, userId);
      }
    });
    
    // Handle notifications when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      // You can show an alert or update UI here
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
    };
  }, []);

  return { 
    fcmToken, 
    getFCMToken,
    getSavedToken,
    updateDeviceToken
  };
};