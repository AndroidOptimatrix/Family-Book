// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StorageKeys =
  | '@authenticated'
  | '@model_open'
  | '@user_info';

export interface StorageMethods {
  setItem: <T>(key: StorageKeys, value: T) => Promise<boolean>;
  getItem: <T>(key: StorageKeys) => Promise<T | null>;
  removeItem: (key: StorageKeys) => Promise<boolean>;
  clear: () => Promise<boolean>;
}

// Storage keys enum
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@authenticated' as StorageKeys,
  MODEL_OPEN: '@model_open' as StorageKeys,
  USER_INFO: '@user_info' as StorageKeys,
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

export const storage: StorageMethods = useAsyncStorage ? {
  // Store data using AsyncStorage
  setItem: async <T>(key: StorageKeys, value: T): Promise<boolean> => {
    try {
      console.log(`💾 Saving to AsyncStorage: ${key} =`, value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
      console.log(`✅ Successfully saved: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving data for key ${key}:`, error);
      return false;
    }
  },

  // Get data using AsyncStorage
  getItem: async <T>(key: StorageKeys): Promise<T | null> => {
    try {
      console.log(`🔍 Reading from AsyncStorage: ${key}`);
      const value = await AsyncStorage.getItem(key);
      console.log(`📖 Raw value for ${key}:`, value);

      if (value === null) {
        console.log(`📭 Key ${key} not found in storage`);
        return null;
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
      await AsyncStorage.clear();
      console.log('✅ Successfully cleared storage');
      return true;
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      return false;
    }
  },
} : getFallbackStorage();

// Test function to verify storage is working
export const testStorage = async (): Promise<void> => {
  console.log('🧪 Testing storage...');
  console.log('Using AsyncStorage:', useAsyncStorage);

  const testKey = '@test_key' as StorageKeys;
  const testValue = { test: 'data', timestamp: Date.now() };

  try {
    // Test setItem
    console.log('1. Testing setItem...');
    const setResult = await storage.setItem(testKey, testValue);
    console.log('setItem result:', setResult);

    // Test getItem
    console.log('2. Testing getItem...');
    const retrievedValue = await storage.getItem<typeof testValue>(testKey);
    console.log('getItem result:', retrievedValue);

    // Test removeItem
    console.log('3. Testing removeItem...');
    const removeResult = await storage.removeItem(testKey);
    console.log('removeItem result:', removeResult);

    // Verify removal
    const afterRemoval = await storage.getItem(testKey);
    console.log('After removal:', afterRemoval);

    console.log('✅ Storage test completed successfully');
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
};

// Debug function to see all storage contents
export const debugStorage = async (): Promise<void> => {
  console.log('🔍 Debugging storage...');

  if (useAsyncStorage) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All storage keys:', allKeys);

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
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
    } catch (error) {
      console.error('Debug error:', error);
    }
  } else {
    console.log('Memory storage contents:', memoryStorage);
  }
};