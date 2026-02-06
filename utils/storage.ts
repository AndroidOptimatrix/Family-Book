import AsyncStorage from '@react-native-async-storage/async-storage';

export type StorageKeys =
  | '@authenticated'
  | '@model_open'
  | '@user_info'
  | '@user_id'
  | '@fcm_token';

export interface StorageMethods {
  setItem: <T>(key: StorageKeys, value: T) => Promise<boolean>;
  getItem: <T>(key: StorageKeys) => Promise<T | null>;
  removeItem: (key: StorageKeys) => Promise<boolean>;
  clear: () => Promise<boolean>;
}

// Storage keys enum - Updated with new keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@authenticated' as StorageKeys,
  MODEL_OPEN: '@model_open' as StorageKeys,
  USER_INFO: '@user_info' as StorageKeys,
  USER_ID: '@user_id' as StorageKeys,
  FCM_TOKEN: '@fcm_token' as StorageKeys,
};

// First, let's check if AsyncStorage is available
const isAsyncStorageAvailable = () => {
  try {
    if (!AsyncStorage) {
      console.error('AsyncStorage is not available');
      return false;
    }
    return true;
  } catch (error) {
    console.error('AsyncStorage availability check failed:', error);
    return false;
  }
};

// Fallback storage for development/web
let memoryStorage: Record<string, string> = {};

const getFallbackStorage = () => {
  return {
    setItem: async <T>(key: StorageKeys, value: T): Promise<boolean> => {
      try {
        memoryStorage[key] = JSON.stringify(value);
        console.warn(`⚠️ Using memory storage for key: ${key}`);
        return true;
      } catch (error) {
        console.error(`Fallback storage error for ${key}:`, error);
        return false;
      }
    },

    getItem: async <T>(key: StorageKeys): Promise<T | null> => {
      try {
        const value = memoryStorage[key];
        if (value !== undefined) {
          console.warn(`⚠️ Retrieving from memory storage for key: ${key}`);
          return JSON.parse(value) as T;
        }
        return null;
      } catch (error) {
        console.error(`Fallback get error for ${key}:`, error);
        return null;
      }
    },

    removeItem: async (key: StorageKeys): Promise<boolean> => {
      try {
        delete memoryStorage[key];
        console.warn(`⚠️ Removing from memory storage for key: ${key}`);
        return true;
      } catch (error) {
        console.error(`Fallback remove error for ${key}:`, error);
        return false;
      }
    },

    clear: async (): Promise<boolean> => {
      try {
        memoryStorage = {};
        console.warn('⚠️ Clearing memory storage');
        return true;
      } catch (error) {
        console.error('Fallback clear error:', error);
        return false;
      }
    }
  };
};

// Choose storage implementation based on availability
const useAsyncStorage = isAsyncStorageAvailable();

// Create a simple wrapper for FCM token storage (always string)
export const fcmStorage = {
  // Save FCM token (always string)
  setToken: async (token: string): Promise<boolean> => {
    try {
      console.log(`💾 Saving FCM token: ${token.substring(0, 30)}...`);
      if (useAsyncStorage) {
        await AsyncStorage.setItem('@fcm_token', token);
      } else {
        memoryStorage['@fcm_token'] = token;
      }
      console.log('✅ FCM token saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
      return false;
    }
  },

  // Get FCM token
  getToken: async (): Promise<string | null> => {
    try {
      let token: string | null;
      if (useAsyncStorage) {
        token = await AsyncStorage.getItem('@fcm_token');
      } else {
        token = memoryStorage['@fcm_token'] || null;
      }

      if (token) {
        console.log(`📖 Retrieved FCM token: ${token.substring(0, 30)}...`);
      } else {
        console.log('📭 No FCM token found in storage');
      }
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  },

  // Remove FCM token
  removeToken: async (): Promise<boolean> => {
    try {
      console.log('🗑️ Removing FCM token');
      if (useAsyncStorage) {
        await AsyncStorage.removeItem('@fcm_token');
      } else {
        delete memoryStorage['@fcm_token'];
      }
      console.log('✅ FCM token removed');
      return true;
    } catch (error) {
      console.error('❌ Error removing FCM token:', error);
      return false;
    }
  }
};

// User ID storage helper
export const userIdStorage = {
  // Save user ID
  setUserId: async (userId: string): Promise<boolean> => {
    try {
      console.log(`💾 Saving user ID: ${userId}`);
      if (useAsyncStorage) {
        await AsyncStorage.setItem('@user_id', userId);
      } else {
        memoryStorage['@user_id'] = userId;
      }
      console.log('✅ User ID saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving user ID:', error);
      return false;
    }
  },

  // Get user ID
  getUserId: async (): Promise<string | null> => {
    try {
      let userId: string | null;
      if (useAsyncStorage) {
        userId = await AsyncStorage.getItem('@user_id');
      } else {
        userId = memoryStorage['@user_id'] || null;
      }

      if (userId) {
        console.log(`📖 Retrieved user ID: ${userId}`);
      } else {
        console.log('📭 No user ID found in storage');
      }
      return userId;
    } catch (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
  },

  // Remove user ID
  removeUserId: async (): Promise<boolean> => {
    try {
      console.log('🗑️ Removing user ID');
      if (useAsyncStorage) {
        await AsyncStorage.removeItem('@user_id');
      } else {
        delete memoryStorage['@user_id'];
      }
      console.log('✅ User ID removed');
      return true;
    } catch (error) {
      console.error('❌ Error removing user ID:', error);
      return false;
    }
  }
};

export const storage: StorageMethods = useAsyncStorage ? {
  // Store data using AsyncStorage
  setItem: async <T>(key: StorageKeys, value: T): Promise<boolean> => {
    try {
      if (key === '@fcm_token' && typeof value !== 'string') {
        console.warn('⚠️ FCM token should be a string, converting...');
        value = String(value) as unknown as T;
      }

      console.log(`💾 Saving to AsyncStorage: ${key} =`,
        key === '@fcm_token' ? (value as unknown as string)?.substring(0, 30) + '...' : value);

      await AsyncStorage.setItem(key, JSON.stringify(value));
      console.log(`✅ Successfully saved: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving data for key ${key}:`, error);
      return false;
    }
  },

  getItem: async <T>(key: StorageKeys): Promise<T | null> => {
    try {
      console.log(`🔍 Reading from AsyncStorage: ${key}`);
      const value = await AsyncStorage.getItem(key);

      if (value === null) {
        console.log(`📭 Key ${key} not found in storage`);
        return null;
      }

      if (key === '@fcm_token') {
        console.log(`📖 FCM token retrieved: ${value.substring(0, 30)}...`);
        return value as unknown as T; // FCM token is stored as plain string
      }

      const parsedValue = JSON.parse(value) as T;
      console.log(`✅ Parsed value for ${key}:`, parsedValue);
      return parsedValue;
    } catch (error) {
      console.error(`❌ Error reading data for key ${key}:`, error);
      return null;
    }
  },

  // Remove data
  removeItem: async (key: StorageKeys): Promise<boolean> => {
    try {
      console.log(`🗑️ Removing from AsyncStorage: ${key}`);
      await AsyncStorage.removeItem(key);
      console.log(`✅ Successfully removed: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error removing data for key ${key}:`, error);
      return false;
    }
  },

  // Clear all data
  clear: async (): Promise<boolean> => {
    try {
      console.log('🧹 Clearing all AsyncStorage');

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => key !== '@fcm_token');

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      console.log('✅ Successfully cleared user-specific storage');
      console.log('📱 FCM token preserved for device');
      return true;
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      return false;
    }
  },
} : getFallbackStorage();

export const clearUserData = async (): Promise<boolean> => {
  try {
    console.log('🧹 Clearing user-specific data only...');

    const keysToRemove: StorageKeys[] = [
      '@authenticated',
      '@model_open',
      '@user_info',
      '@user_id'
    ];

    for (const key of keysToRemove) {
      await storage.removeItem(key);
    }

    console.log('✅ User data cleared, FCM token preserved');
    return true;
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    return false;
  }
};


export const debugStorage = async (): Promise<void> => {
  console.log('🔍 Debugging storage...');

  if (useAsyncStorage) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All storage keys:', allKeys);

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);

        if (key === '@fcm_token') {
          console.log(`📦 ${key}:`, value ? `${value.substring(0, 30)}...` : 'null');
        } else {
          console.log(`📦 ${key}:`, value);

          // Try to parse if it's JSON
          if (value) {
            try {
              const parsed = JSON.parse(value);
              console.log(`   Parsed:`, parsed);
            } catch {
              console.log(`   Raw string: ${value}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
  } else {
    console.log('Memory storage contents:', memoryStorage);
  }
};

// Quick access functions
export const getStoredFCMToken = fcmStorage.getToken;
export const setStoredFCMToken = fcmStorage.setToken;
export const getStoredUserId = userIdStorage.getUserId;
export const setStoredUserId = userIdStorage.setUserId;
export const removeItem = storage.removeItem;