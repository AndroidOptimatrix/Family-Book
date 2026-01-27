// src/config/firebase.ts
import { FirebaseApp, initializeApp } from '@react-native-firebase/app';

let firebaseApp: FirebaseApp | null = null;
let isInitializing = false;

export const initializeFirebase = async (): Promise<FirebaseApp> => {
    if (firebaseApp) {
        return firebaseApp;
    }

    if (isInitializing) {
        // Wait for initialization to complete
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (firebaseApp) {
                    clearInterval(checkInterval);
                    resolve(firebaseApp);
                }
            }, 100);
        });
    }

    isInitializing = true;
    console.log('🔥 Initializing Firebase...');

    try {
        // Check if default app is already initialized to avoid error
        const app = require('@react-native-firebase/app').default;
        if (app.apps.length > 0) {
            console.log('✅ Firebase already initialized natively');
            firebaseApp = app.app();
            return firebaseApp as FirebaseApp;
        }

        // For React Native Firebase v17+, initializeApp() returns Promise
        // For v16 and below, it returns FirebaseApp directly
        console.log('⚠️ Native initialization failed, initializing manually...');
        firebaseApp = await initializeApp({
            apiKey: "AIzaSyBuuFnTp3VWrDQ2xd8kEMzMKYjwW9Ui8pQ",
            authDomain: "react-native-fe332.firebaseapp.com",
            projectId: "react-native-fe332",
            storageBucket: "react-native-fe332.firebasestorage.app",
            messagingSenderId: "841393732050",
            appId: "1:841393732050:android:638ae6ce6689282a63300b",
        });
        console.log('✅ Firebase initialized successfully (Manual)');
        return firebaseApp as FirebaseApp;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
    } finally {
        isInitializing = false;
    }
};

export const getFirebaseApp = (): FirebaseApp => {
    if (!firebaseApp) {
        throw new Error('Firebase has not been initialized. Call initializeFirebase() first.');
    }
    return firebaseApp;
};

export const isFirebaseInitialized = (): boolean => {
    return firebaseApp !== null;
};