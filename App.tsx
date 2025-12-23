import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './pages/login-screen';
import SplashScreen from './pages/splash-screen';
import DashboardScreen from './pages/dashboard-screen';
import NotificationScreen from './pages/notification-screen';
import EventsScreen from './pages/events-screen';
import { AuthProvider, useAuth } from './context/auth-context';
import AdvertisementScreen from './pages/advertisement-screen';
import VideoScreen from './pages/videos-screen';
import ProfileScreen from './pages/profile-screen';
import SupportScreen from './pages/support-screen';
// import SupportScreen from './pages/support-screen';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Dashboard: undefined;
  Notifications: undefined;
  Birthdays: undefined;
  Anniversaries: undefined;
  Videos: undefined;
  Events: undefined;
  Profile: undefined;
  Advertisements: undefined;
  Help: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create Dashboard Stack Navigator for nested screens
const DashboardStack = createNativeStackNavigator();

const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
      <DashboardStack.Screen name="Notifications" component={NotificationScreen} />
      <DashboardStack.Screen name="Events" component={EventsScreen} />
      {/* <DashboardStack.Screen name="Birthdays" component={BirthdayScreen} /> */}
      {/* <DashboardStack.Screen name="Anniversaries" component={AnniversariesScreen} /> */}
      <DashboardStack.Screen name="Videos" component={VideoScreen} />
      <DashboardStack.Screen name="Profile" component={ProfileScreen} />
      <DashboardStack.Screen name="Advertisements" component={AdvertisementScreen} />
      <DashboardStack.Screen name="Support" component={SupportScreen} />
    </DashboardStack.Navigator>
  );
};

// Inner component that uses auth context
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, requiresRegistration } = useAuth();
  const [splashVisible, setSplashVisible] = useState<boolean>(true);
  const [minSplashTime, setMinSplashTime] = useState<boolean>(false);

  // Show splash for minimum 2 seconds for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashTime(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash when auth check is done and minimum time has passed
  useEffect(() => {
    if (!isLoading && minSplashTime) {
      setSplashVisible(false);
    }
  }, [isLoading, minSplashTime]);

  const handleLoginSuccess = () => {
    // Login success is handled by auth context
  };

  if (splashVisible) {
    return (
      <SplashScreen
        onAnimationComplete={() => {
          if (!isLoading && minSplashTime) {
            setSplashVisible(false);
          }
        }}
        logoSource={require('./logo-2.png')}
        appName="Family Book"
        tagline="Connecting Families"
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated || requiresRegistration ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardStackNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component with AuthProvider
const App: React.FC = () => {
  const handleLoginSuccess = (userInfo: any) => {
    console.log('✅ User logged in:', userInfo);
  };

  const handleRegistrationRequired = (phoneNumber: string) => {
    console.log('📝 Registration required for phone:', phoneNumber);
  };

  return (
    <AuthProvider
      onLoginSuccess={handleLoginSuccess}
      onRegistrationRequired={handleRegistrationRequired}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppContent />
    </AuthProvider>
  );
};

export default App;