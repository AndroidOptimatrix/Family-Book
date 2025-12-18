import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Keyboard,
  Animated,
  Easing,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { 
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from 'react-native-feather';

const logoSource = require('../logo-2.png');

const { width } = Dimensions.get('window');

interface OTPScreenProps {
  email: string;
  phone: string;
  onBack: () => void;
  onVerifySuccess: () => void;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ 
  email, 
  phone,
  onBack, 
  onVerifySuccess 
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(59);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('phone');
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const checkmarkAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-select verification method
    setVerificationMethod(email ? 'email' : 'phone');
    
    let interval: number = 30;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        progressAnimation.setValue(1 - (timer / 60));
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, progressAnimation, email]);

  const startShake = (): void => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showSuccessAnimation = (): void => {
    Animated.timing(checkmarkAnimation, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleOtpChange = (text: string, index: number): void => {
    if (text.length > 1) {
      const otpArray = text.split('').slice(0, 6);
      const newOtp = [...otp];
      otpArray.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastFilledIndex = otpArray.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (text && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number): void => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (): Promise<void> => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      startShake();
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      showSuccessAnimation();
      
      setTimeout(() => {
        onVerifySuccess();
      }, 1500);
    }, 2000);
  };

  const handleResend = (): void => {
    if (!canResend) return;
    
    setTimer(59);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    Alert.alert('OTP Resent', `New OTP has been sent to your ${verificationMethod}.`);
    
    // Focus first input
    inputRefs.current[0]?.focus();
  };

  const toggleVerificationMethod = (): void => {
    setVerificationMethod(prev => prev === 'email' ? 'phone' : 'email');
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Success Animation Overlay */}
      {isVerified && (
        <Animated.View 
          style={[
            styles.successOverlay,
            {
              opacity: checkmarkAnimation,
              transform: [{
                scale: checkmarkAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <CheckCircle stroke="#10B981" width={80} height={80} strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>Verified!</Text>
          <Text style={styles.successText}>Your account is now verified</Text>
          <ActivityIndicator color="#10B981" size="large" style={{ marginTop: 32 }} />
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            disabled={isLoading || isVerified}
          >
            <ArrowLeft stroke="#6366F1" width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Verification Illustration */}
        <View style={styles.illustrationContainer}>
          <Animated.View 
            style={[
              styles.shieldContainer,
              {
                transform: [{
                  rotate: checkmarkAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              },
            ]}
          >
            <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="App Logo"
          />
          </Animated.View>
          
          <Text style={styles.title}>Verify Your Account</Text>
          
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your {verificationMethod === 'email' ? 'email' : 'phone'}
          </Text>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            {verificationMethod === 'email' ? (
              <Mail stroke="#6366F1" width={20} height={20} />
            ) : (
              <Phone stroke="#6366F1" width={20} height={20} />
            )}
            <Text style={styles.contactText}>
              {verificationMethod === 'email' ? email : phone}
            </Text>
            <TouchableOpacity 
              style={styles.switchMethodButton}
              onPress={toggleVerificationMethod}
              disabled={isLoading || isVerified}
            >
              <Text style={styles.switchMethodText}>Switch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Progress Bar */}
        <View style={styles.timerProgressContainer}>
          <View style={styles.timerProgressBar}>
            <Animated.View 
              style={[
                styles.timerProgressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <View style={styles.timerTextContainer}>
            <Clock stroke="#6366F1" width={18} height={18} />
            <Text style={styles.timerText}>
              Code expires in:{' '}
              <Text style={styles.timerCount}>{formatTimer(timer)}</Text>
            </Text>
          </View>
        </View>

        {/* OTP Input Section */}
        <Animated.View 
          style={[
            styles.otpSection,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          <Text style={styles.otpLabel}>Enter verification code</Text>
          
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  otp[index] ? styles.otpBoxFilled : styles.otpBoxEmpty,
                  (isLoading || isVerified) && styles.otpBoxDisabled,
                ]}
              >
                <TextInput
                  // ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? 6 : 1}
                  selectTextOnFocus
                  editable={!isVerified && !isLoading}
                  placeholder="•"
                  placeholderTextColor="#9CA3AF"
                  selectionColor="#6366F1"
                />
              </View>
            ))}
          </View>

          {/* Auto-fill Button */}
          <TouchableOpacity 
            style={styles.autoFillButton}
            onPress={() => handleOtpChange('123456', 0)}
            disabled={isLoading || isVerified}
          >
            <Text style={styles.autoFillText}>Use Demo Code: 123456</Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isLoading || isVerified) && styles.verifyButtonDisabled
            ]}
            onPress={handleVerify}
            disabled={isLoading || isVerified}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : isVerified ? (
              <View style={styles.verifiedContainer}>
                <CheckCircle stroke="white" width={22} height={22} />
                <Text style={styles.verifyButtonText}>Verified</Text>
              </View>
            ) : (
              <View style={styles.verifyContent}>
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
                <ChevronRight stroke="#FFFFFF" width={20} height={20} style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, (isLoading || isVerified) && styles.disabledText]}>
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              style={[
                styles.resendButton, 
                (!canResend || isLoading || isVerified) && styles.resendButtonDisabled
              ]}
              onPress={handleResend}
              disabled={!canResend || isLoading || isVerified}
              activeOpacity={0.7}
            >
              <RefreshCw 
                stroke={canResend && !isLoading && !isVerified ? "#6366F1" : "#9CA3AF"} 
                width={20} 
                height={20} 
              />
              <Text style={[
                styles.resendButtonText,
                (!canResend || isLoading || isVerified) && styles.resendButtonTextDisabled
              ]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <AlertCircle stroke="#6366F1" width={24} height={24} />
          <Text style={styles.helpText}>
            If you don't see the {verificationMethod === 'email' ? 'email' : 'message'} in your {verificationMethod === 'email' ? 'inbox' : 'inbox'}, 
            please check your spam or junk folder. The code is valid for 1 minute.
          </Text>
        </View>

        {/* OTP Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Tips:</Text>
          <View style={styles.instructionItem}>
            <View style={styles.instructionDot} />
            <Text style={styles.instructionText}>You can paste a 6-digit code directly into the first box</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionDot} />
            <Text style={styles.instructionText}>Use the demo code "123456" for testing</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionDot} />
            <Text style={styles.instructionText}>Code will auto-advance as you type</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 48,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  shieldContainer: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: '#b9baf1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8082f3ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    flex: 1,
  },
  switchMethodButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  timerProgressContainer: {
    marginBottom: 32,
  },
  timerProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  timerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  timerCount: {
    fontWeight: 'bold',
    color: '#6366F1',
  },
  otpSection: {
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
    logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: (width - 48 - 100) / 6, // Account for padding and gaps
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  otpBoxEmpty: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  otpBoxDisabled: {
    opacity: 0.5,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  autoFillButton: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  autoFillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  verifyButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  helpContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#92400E',
    marginTop: 6,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  successText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default OTPScreen;