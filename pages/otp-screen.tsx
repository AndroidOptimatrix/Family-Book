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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const checkmarkAnimation = useRef(new Animated.Value(0)).current;
  
  const verificationMethod = 'email'; // or 'phone'

  useEffect(() => {
    let interval: number = 30;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

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
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleOtpChange = (text: string, index: number): void => {
    if (text.length > 1) {
      const otpArray = text.split('').slice(0, 6);
      const newOtp = [...otp];
      otpArray.forEach((digit, idx) => {
        newOtp[idx] = digit;
      });
      setOtp(newOtp);
      Keyboard.dismiss();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      showSuccessAnimation();
      
      setTimeout(() => {
        Alert.alert(
          'Success!',
          'Your account has been verified successfully.',
          [{ 
            text: 'Continue', 
            onPress: onVerifySuccess
          }]
        );
      }, 1500);
    }, 2000);
  };

  const handleResend = (): void => {
    if (!canResend) return;
    
    setTimer(59);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    Alert.alert('OTP Resent', `New OTP has been sent to your ${verificationMethod}.`);
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
            <MaterialIcons name="verified" size={80} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Verified!</Text>
          <Text style={styles.successText}>Your account is now verified</Text>
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6366F1" />
        </TouchableOpacity>

        {/* Verification Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.shieldContainer}>
            <MaterialCommunityIcons name="shield-check" size={56} color="white" />
          </View>
          <Text style={styles.title}>
            Verify Phone Number
          </Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email
          </Text>
          <View style={styles.contactContainer}>
            <MaterialIcons name="phone" size={20} color="#6366F1" />
            <Text style={styles.contactText}>
              {phone}
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
                  otp[index] ? styles.otpBoxFilled : styles.otpBoxEmpty
                ]}
              >
                <TextInput
                //   ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isVerified}
                />
              </View>
            ))}
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <MaterialIcons name="timer" size={20} color="#6B7280" />
            <Text style={styles.timerText}>
              Code expires in:{' '}
              <Text style={styles.timerCount}>00:{timer.toString().padStart(2, '0')}</Text>
            </Text>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isLoading || isVerified) && styles.verifyButtonDisabled
            ]}
            onPress={handleVerify}
            disabled={isLoading || isVerified}
          >
            {isLoading ? (
              <Text style={styles.verifyButtonText}>Verifying...</Text>
            ) : isVerified ? (
              <View style={styles.verifiedContainer}>
                <MaterialIcons name="check" size={22} color="white" />
                <Text style={styles.verifyButtonText}>Verified</Text>
              </View>
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
              onPress={handleResend}
              disabled={!canResend}
            >
              <MaterialIcons name="refresh" size={20} color={canResend ? "#6366F1" : "#9CA3AF"} />
              <Text style={[
                styles.resendButtonText,
                !canResend && styles.resendButtonTextDisabled
              ]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoText}>i</Text>
          </View>
          <Text style={styles.helpText}>
            If you don't see the email in your inbox, please check your spam or junk folder. 
            The code is valid for 10 minutes.
          </Text>
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
    paddingTop: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  shieldContainer: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
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
    marginBottom: 8,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 64,
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
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  timerCount: {
    fontWeight: 'bold',
    color: '#6366F1',
  },
  verifyButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
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
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    marginLeft: 8,
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  helpContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
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
  },
});

export default OTPScreen;