import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  getStoredFCMToken,
  setStoredFCMToken,
  getStoredUserId
} from '../utils/storage';
import {
  getFCMToken as fetchNewFCMToken,
  sendTokenToBackend,
  syncFCMToken
} from '../utils/fcm-helper';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Wrapper to match existing interface if needed, or just use helper directly
  const getFCMToken = async () => {
    const token = await fetchNewFCMToken();
    if (token) {
      setFcmToken(token);
      // Sync if we have a user
      const userId = await getStoredUserId();
      if (userId) {
        await sendTokenToBackend(token, userId);
      }
    }
    return token;
  };

  const getSavedToken = async () => {
    return await getStoredFCMToken();
  };

  const updateDeviceToken = async (userId: string) => {
    return await syncFCMToken(userId);
  };

  useEffect(() => {
    // Initial check
    const init = async () => {
      const token = await getFCMToken();
      if (token) setFcmToken(token);
    };
    init();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM token refreshed (listener):', newToken.substring(0, 30) + '...');

      // Save new token
      await setStoredFCMToken(newToken);
      setFcmToken(newToken);

      // Update backend if we have userId - using the shared helper logic? 
      // specific logic here to be safe:
      const userId = await getStoredUserId();
      if (userId) {
        console.log('👤 User ID found, syncing refreshed token...');
        await sendTokenToBackend(newToken, userId);
      }
    });

    // Handle notifications when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground notification received:', remoteMessage);
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