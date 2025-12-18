import React, { useEffect, useState } from 'react';
import { StatusBar, Alert } from 'react-native';
import LoginScreen from './pages/login-screen';
import RegisterScreen from './pages/registration-screen';
import OTPScreen from './pages/otp-screen';
import SplashScreen from './pages/splash-screen';
import DashboardScreen from './pages/dashboard-screen'; // Import Dashboard
import { AuthProvider } from './context/auth-context';

type ScreenType = 'login' | 'register' | 'otp' | 'dashboard';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Simulate loading (replace with your actual loading logic)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Reduced to 3 seconds for better UX

    return () => clearTimeout(timer);
  }, []);

  // Check if user is already logged in (you can implement proper auth check here)
  useEffect(() => {
    const checkAuth = async () => {
      // Add your actual authentication check logic here
      // For example: check AsyncStorage for auth token
      // const token = await AsyncStorage.getItem('authToken');
      // if (token) {
      //   setIsAuthenticated(true);
      //   setCurrentScreen('dashboard');
      // }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <SplashScreen
        onAnimationComplete={() => setLoading(false)}
        logoSource={require('./logo-2.png')}
        appName="Family Book"
        tagline="Connecting Families"
      />
    );
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    Alert.alert('Success', 'Welcome to Family Book!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    Alert.alert('Logged Out', 'You have been logged out successfully.');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'register':
        return (
          <RegisterScreen
            onBack={() => setCurrentScreen('login')}
            onRegisterSuccess={(phone: string) => {
              setPhone(phone);
              setCurrentScreen('otp');
            }}
          />
        );
      case 'otp':
        return (
          <OTPScreen
            email={email}
            phone={phone}
            onBack={() => setCurrentScreen('register')}
            onVerifySuccess={() => {
              setIsAuthenticated(true);
              setCurrentScreen('dashboard');
              Alert.alert('Success', 'Account verified successfully! Welcome to Family Book.');
            }}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen />
        );
      default:
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        );
    }
  };

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderScreen()}
    </AuthProvider>
  );
};

export default App;