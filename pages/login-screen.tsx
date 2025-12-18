// screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  Alert,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppThemeGradient } from '../config/config';
import { 
  Header, 
  LoginForm, 
  TermsFooter, 
  FloatingElements, 
  CountryPickerWrapper, 
  NameCollectionModal 
} from '../components/login/index';
import { useAuth } from '../context/auth-context';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: (userName?: string) => void;
  onNavigateToRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess
}) => {
  const { isLoading, requiresRegistration, completeProfile } = useAuth();
  
  const [countryCode, setCountryCode] = useState<'IN' | 'US' | string>('IN');
  const [countryCallingCode, setCountryCallingCode] = useState('91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Show name modal when registration is required
  useEffect(() => {
    if (requiresRegistration) {
      setShowNameModal(true);
    }
  }, [requiresRegistration]);

  // Start countdown timer when OTP is sent
  useEffect(() => {
    if (otpSent) {
      startResendTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [otpSent]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    setCanResend(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getFormattedPhoneForDisplay = () => {
    const formattedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    return `+${countryCallingCode} ${formattedPhone}`;
  };

  const handleNameSubmit = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      await completeProfile(userName);
      // Success will be handled by AuthContext
      setShowNameModal(false);
      Alert.alert(
        'Welcome to Family Book!',
        `Hi ${userName}, your account has been created successfully!`,
        [{ text: 'Get Started', onPress: () => onLoginSuccess(userName) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      <CountryPickerWrapper
        visible={showCountryPicker}
        countryCode={countryCode}
        onSelect={(code: string, callingCode: string) => {
          setCountryCode(code);
          setCountryCallingCode(callingCode);
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
      />

      <NameCollectionModal
        visible={showNameModal}
        userName={userName}
        phoneNumber={getFormattedPhoneForDisplay()}
        onNameChange={setUserName}
        onSubmit={handleNameSubmit}
        onClose={() => setShowNameModal(false)}
      />

      <LinearGradient
        colors={AppThemeGradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Header otpSent={otpSent} />

              <LoginForm
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                countryCallingCode={countryCallingCode}
                setCountryCallingCode={setCountryCallingCode}
                otpSent={otpSent}
                setOtpSent={setOtpSent}
                otp={otp}
                setOtp={setOtp}
                resendTimer={resendTimer}
                setResendTimer={setResendTimer}
                canResend={canResend}
                setCanResend={setCanResend}
                onRegistrationRequired={() => setShowCountryPicker(true)}
              />

              <TermsFooter />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <FloatingElements />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    paddingVertical: 20,
    minHeight: height,
  },
  content: {
    paddingHorizontal: 24,
  },
});

export default LoginScreen;