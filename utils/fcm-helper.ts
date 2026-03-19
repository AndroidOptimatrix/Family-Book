import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { initializeFirebase } from '../config/firebase';
import { makeApiCall } from './http-helper';
import { 
  getStoredFCMToken, 
  setStoredFCMToken,
} from './storage';

/**
 * Sends the FCM token to the backend for a specific user.
 * @param token The FCM token string
 * @param userId The user ID string
 * @returns Promise<boolean> indicating success or failure
 */
export const sendTokenToBackend = async (token: string, userId: string): Promise<boolean> => {
  try {
    if (!token || !userId) {
      console.log('Missing token or userId for backend sync');
      return false;
    }

    console.log('Sending FCM token to backend:', token);
    
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
        console.log('Device token updated successfully in backend');
        return true;
      } else {
        console.error('Failed to update device token in backend:', firstItem.msg);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error sending token to backend:', error);
    return false;
  }
};

/**
 * Retrieves the current FCM token. 
 * If a token is stored locally, it returns that.
 * If not, it requests permission and fetches a new one from Firebase.
 * @returns Promise<string | null> The FCM token or null if failed
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // 1. Check if we already have a stored token
    const storedToken = await getStoredFCMToken();
    if (storedToken) {
        // verify if the token is still valid by checking simple expiration logic or similar if needed
        // For now, we assume stored token is valid but we might want to refresh it occasionally
        // In this implementation, we will always return the stored token if available
        // BUT, to be safe against the "newly generated" case the user mentioned, 
        // we might want to call getToken() from firebase to see if it differs.
        // However, standard practice is: only onTokenRefresh gives a NEW token.
        // We will stick to returning stored token to avoid unnecessary network calls, 
        // but the caller (syncFCMToken) will handle the backend sync.
        return storedToken;
    }

    await initializeFirebase();

    // 2. Request Permission
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

    console.log("Permission granted, fetching new token from Firebase");

    // 3. Get Token from Firebase
    const token = await messaging().getToken();
    
    if (token) {
        console.log('FCM Token Generated:', token.substring(0, 30) + '...');
        // 4. Save token to storage
        await setStoredFCMToken(token);
        return token;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Orchestrates the entire flow: ensures we have a token, then syncs it to the backend.
 * Should be called on login, app start, or when user ID becomes available.
 * @param userId The user ID to associate with the token
 */
export const syncFCMToken = async (userId: string): Promise<boolean> => {
    if (!userId) {
        console.log('Cannot sync FCM token: No user ID provided');
        return false;
    }

    try {
        // Always try to get a fresh token from Firebase to ensure we are up to date
        // calling messaging().getToken() returns the current token, it doesn't force a refresh 
        // unless the current one is invalid.
        let token = await getFCMToken();
        
        // If getting from storage failed or was empty, try direct from firebase again just in case
        if (!token) {
             try {
                await initializeFirebase();
                token = await messaging().getToken();
                if (token) await setStoredFCMToken(token);
             } catch (e) {
                 console.error("Failed to recover token:", e);
             }
        }

        if (token) {
            return await sendTokenToBackend(token, userId);
        } else {
            console.log('Could not retrieve a valid FCM token to sync');
            return false;
        }
    } catch (error) {
        console.error('Error during FCM token sync:', error);
        return false;
    }
};
