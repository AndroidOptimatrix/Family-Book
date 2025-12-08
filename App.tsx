import React, { useState } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import LoginScreen from './pages/login-screen';
import RegisterScreen from './pages/registration-screen';
import OTPScreen from './pages/otp-screen';

type ScreenType = 'login' | 'register' | 'otp';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'register':
        return (
          <RegisterScreen 
            onBack={() => setCurrentScreen('login')}
            onRegisterSuccess={(userEmail: string, userPhone: string) => {
              setEmail(userEmail);
              setPhone(userPhone);
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
              setCurrentScreen('login');
              Alert.alert('Account verified successfully!');
            }}
          />
        );
      default:
        return (
          <LoginScreen 
            onLoginSuccess={() => {
              Alert.alert('Login successful!');
            }}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        );
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderScreen()}
    </>
  );
};

export default App;