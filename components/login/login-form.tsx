import OTPInput from './otp-input';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight, ChevronDown } from 'react-native-feather';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Image,
    Alert,
} from 'react-native';

interface LoginFormProps {
    phoneNumber: string;
    setPhoneNumber: (phone: string) => void;
    countryCallingCode: string;
    setCountryCallingCode: (code: string) => void;
    otpSent: boolean;
    setOtpSent: (sent: boolean) => void;
    otp: string;
    setOtp: (otp: string) => void;
    resendTimer: number;
    setResendTimer: (timer: number) => void;
    canResend: boolean;
    setCanResend: (can: boolean) => void;
    onPhoneVerified?: (phone: string) => void;
    onRegistrationRequired?: () => void;
    keyboardVisible?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
    phoneNumber,
    setPhoneNumber,
    countryCallingCode,
    otpSent,
    setOtpSent,
    otp,
    setOtp,
    resendTimer,
    setResendTimer,
    canResend,
    setCanResend,
    onPhoneVerified,
    onRegistrationRequired,
    keyboardVisible = false
}) => {
    const { isLoading, sendOtp, verifyOtp } = useAuth();
    const [buttonScale] = useState(new Animated.Value(1));

    useEffect(() => {
        let interval: number | null = null;

        if (otpSent && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev: number) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [otpSent, resendTimer]);

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getFormattedPhoneForDisplay = () => {
        const formattedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        return `+${countryCallingCode} ${formattedPhone}`;
    };

    const handlePhoneNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setPhoneNumber(cleaned);
    };

    const validatePhoneNumber = (): boolean => {
        // Clean the phone number - remove all non-digit characters
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
        
        // ONLY ONE VALIDATION: Check if phone number is empty
        if (!cleanPhoneNumber || cleanPhoneNumber.trim() === '') {
            Alert.alert(
                'Mobile Number Required',
                'Please enter your mobile number to receive OTP.',
                [{ text: 'OK', style: 'default' }]
            );
            return false;
        }
        
        return true;
    };

    const handleSendOtp = async () => {
        // Validate phone number before sending OTP
        if (!validatePhoneNumber()) {
            return;
        }
        
        try {
            await sendOtp(phoneNumber, countryCallingCode);
            setOtpSent(true);
            setResendTimer(30);
            setCanResend(false);
            if (onPhoneVerified) {
                onPhoneVerified(`${countryCallingCode}${phoneNumber}`);
            }
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', error.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const fullPhone = `${countryCallingCode}${phoneNumber}`;
            await verifyOtp(fullPhone, otp);
            // Success will be handled by AuthContext
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            Alert.alert('Error', error.message || 'OTP verification failed');
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            await sendOtp(phoneNumber, countryCallingCode);
            setResendTimer(30);
            setCanResend(false);
            Alert.alert('Success', 'OTP resent successfully!');
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            Alert.alert('Error', error.message || 'Failed to resend OTP');
        }
    };

    const handleChangeNumber = () => {
        setOtpSent(false);
        setOtp('');
        setPhoneNumber('');
        setCanResend(false);
        setResendTimer(30);
    };

    const handleLogin = () => {
        if (otpSent) {
            handleVerifyOtp();
        } else {
            handleSendOtp();
        }
    };

    return (
        <View style={[styles.formContainer, keyboardVisible && styles.containerKeyboardOpen]}>
            {!otpSent ? (
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WhatsApp Number</Text>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.countryCodeButton}
                            onPress={() => {
                                // Country picker will be handled by parent
                                if (onRegistrationRequired) {
                                    onRegistrationRequired();
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.countryCodeText}>+{countryCallingCode}</Text>
                            <ChevronDown stroke="#6B7280" width={16} height={16} />
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your number"
                            placeholderTextColor="#9CA3AF"
                            value={phoneNumber}
                            onChangeText={handlePhoneNumberChange}
                            keyboardType="phone-pad"
                            maxLength={15}
                            editable={!isLoading}
                            selectionColor="#3B82F6"
                            autoComplete="tel"
                        />
                    </View>
                    <Text style={styles.inputHelper}>
                        We'll send a 4-digit verification code via WhatsApp message
                    </Text>
                </View>
            ) : (
                <View style={styles.otpContainer}>
                    <View style={styles.otpHeader}>
                        <Image source={require('../../whatsapp.png')} style={{ width: 40, height: 40 }} />
                        <Text style={styles.otpTitle}>Enter OTP</Text>
                    </View>
                    <Text style={styles.otpSubtitle}>
                        Sent to {getFormattedPhoneForDisplay()} via WhatsApp
                    </Text>

                    <OTPInput
                        value={otp}
                        onChangeText={setOtp}
                        editable={!isLoading}
                    />

                    <View style={styles.otpActions}>
                        <TouchableOpacity onPress={handleChangeNumber} disabled={isLoading}>
                            <Text style={[styles.resendText, isLoading && styles.disabledText]}>
                                Change number
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.verticalDivider} />
                        <TouchableOpacity onPress={handleResendOtp} disabled={!canResend || isLoading}>
                            {canResend ? (
                                <Text style={[styles.resendText, isLoading && styles.disabledText]}>
                                    Resend OTP
                                </Text>
                            ) : (
                                <Text style={styles.timerText}>
                                    Resend in {formatTimer(resendTimer)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={() => {
                        animateButton();
                        handleLogin();
                    }}
                    disabled={isLoading}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#1E40AF']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.loginButtonText}>
                                    {otpSent ? 'Verify & Continue' : 'Send OTP via WhatsApp'}
                                </Text>
                                <ChevronRight stroke="#FFFFFF" width={20} height={20} />
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowRadius: 25,
        zIndex: 50
    },
    containerKeyboardOpen: {
        marginTop: -20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        padding: 10
    },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        minWidth: 40,
        padding: 4
    },
    countryCodeText: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
        marginRight: 4,
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        padding: 0,
        fontWeight: '500',
        minHeight: 40,
    },
    inputHelper: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 8,
        marginLeft: 4,
    },
    otpContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    otpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    otpTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    otpActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resendText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    timerText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    verticalDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#D1D5DB',
    },
    loginButton: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 10,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    disabledText: {
        opacity: 0.5,
    },
});

export default LoginForm;