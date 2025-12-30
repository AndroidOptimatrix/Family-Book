import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { X, Check, ArrowLeft, Phone, User } from 'react-native-feather';
import { useAuth } from '../../context/auth-context';
import useProfile from '../../hooks/useProfile';

const { width } = Dimensions.get('window');

interface EditProfileModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSuccess }) => {
    const { userInfo, updateUserInfo } = useAuth();
    const { updateUserProfile, loading, error, clearError, data } = useProfile();

    const [name, setName] = useState<string>('');
    const [mobile, setMobile] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [mobileChanged, setMobileChanged] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);
    const [storedNewMobile, setStoredNewMobile] = useState<string>(''); // Store the new mobile for OTP step

    const mobileInputRef = useRef<TextInput>(null);
    const otpInputRef = useRef<TextInput>(null);

    // Initialize form with user data
    useEffect(() => {
        if (userInfo) {
            setName(userInfo.user_name || userInfo.name || '');
            setMobile(userInfo.mobile || '');
        }
    }, [userInfo]);

    // Check if mobile number is changed
    useEffect(() => {
        const originalMobile = userInfo?.mobile || '';
        const isChanged = mobile !== originalMobile && mobile.trim() !== '';
        setMobileChanged(isChanged);

        if (isChanged) {
            setStoredNewMobile(mobile); // Store the new mobile when it changes
        }
    }, [mobile, userInfo]);

    // Handle countdown timer
    useEffect(() => {
        let timer: number;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    // Monitor API response to switch to OTP step
    useEffect(() => {
        if (data && mobileChanged && step === 'form') {
            // Check if API response indicates OTP is required
            if (data.requires_verification) {
                setOtpSent(true);
                setStep('otp');
                setCountdown(60);

                // Focus on OTP input
                setTimeout(() => {
                    otpInputRef.current?.focus();
                }, 100);

                Alert.alert(
                    'OTP Sent',
                    data.msg || 'OTP has been sent to your new mobile number. Please verify to complete the update.',
                    [{ text: 'OK' }]
                );
            }
        }
    }, [data, mobileChanged, step]);

    const formatPhoneNumber = (phone: string): string => {
        let cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.substring(2);
        }

        return cleanPhone;
    };

    const validateMobile = (phone: string): boolean => {
        const cleanPhone = formatPhoneNumber(phone);
        // Indian mobile number validation: starts with 6-9 and 10 digits
        return /^[6-9]\d{9}$/.test(cleanPhone);
    };

    const handleUpdate = async () => {
        clearError();

        if (!userInfo?.user_id) {
            Alert.alert('Error', 'User ID not found');
            return;
        }

        const userId = userInfo.user_id.toString();
        const nameToUpdate = name.trim();
        const mobileToUpdate = formatPhoneNumber(mobile);

        // Check if name is provided (at least name or mobile should be provided)
        if (!nameToUpdate && !mobileToUpdate) {
            Alert.alert('Error', 'Please provide name or mobile to update');
            return;
        }

        // Validate mobile if it's provided
        if (mobileToUpdate && !validateMobile(mobileToUpdate)) {
            Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit Indian mobile number starting with 6-9');
            return;
        }

        console.log('Update parameters:', {
            userId,
            nameToUpdate,
            mobileToUpdate,
            mobileChanged,
            originalMobile: userInfo.mobile,
            step
        });

        try {
            // If mobile is changed and we're not in OTP step yet
            if (mobileChanged && step === 'form') {
                console.log('Sending OTP request for mobile change...');
                // Send OTP request - just pass the mobile
                const result = await updateUserProfile(userId, nameToUpdate, mobileToUpdate);

                console.log('OTP request response:', result);

                // The useEffect above will handle switching to OTP step

            } else if (step === 'otp' && otp.trim() !== '') {
                console.log('Verifying OTP...');
                // Verify OTP and update
                const result = await updateUserProfile(userId, nameToUpdate, storedNewMobile, otp.trim());

                console.log('OTP verification response:', result);

                if (result.mobile_updated || result.result === 'success') {
                    await handleSuccess(result);
                }
            } else {
                console.log('Updating only name...');
                // Update only name (no mobile change)
                const result = await updateUserProfile(userId, nameToUpdate);
                await handleSuccess(result);
            }
        } catch (error: any) {
            console.log('Update error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        }
    };

    const handleSuccess = async (result?: any) => {
        try {
            // Prepare updated info
            const updatedInfo: any = {};

            // Update name if available
            if (result?.updated_data?.name) {
                updatedInfo.user_name = result.updated_data.name;
                updatedInfo.name = result.updated_data.name;
            }

            // Update mobile if available
            if (result?.updated_data?.mobile) {
                updatedInfo.mobile = result.updated_data.mobile;
            }

            // Update in auth context if we have changes
            if (Object.keys(updatedInfo).length > 0) {
                await updateUserInfo(updatedInfo);
            }

            // Show success message
            const successMsg = result?.msg || 'Profile updated successfully';
            Alert.alert('Success', successMsg, [
                {
                    text: 'OK',
                    onPress: () => {
                        // Call success callback
                        if (onSuccess) {
                            onSuccess();
                        }

                        // Close modal
                        onClose();
                    }
                }
            ]);

        } catch (error) {
            console.error('Error in handleSuccess:', error);
            Alert.alert('Success', 'Profile updated, but there was an error refreshing your data.', [
                {
                    text: 'OK',
                    onPress: () => {
                        onClose();
                    }
                }
            ]);
        }
    };

    const handleResendOtp = async () => {
        if (!userInfo?.user_id || countdown > 0) return;

        clearError();
        const userId = userInfo.user_id.toString();
        const mobileToUpdate = formatPhoneNumber(storedNewMobile);

        try {
            const result = await updateUserProfile(userId, '', mobileToUpdate);

            if (result.requires_verification) {
                setCountdown(60);
                Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number.');
            }
        } catch (error) {
            console.log('Resend OTP error:', error);
            Alert.alert('Error', 'Failed to resend OTP');
        }
    };

    const handleBackToForm = () => {
        setStep('form');
        setOtp('');
        setOtpSent(false);
        clearError();
    };

    const renderFormStep = () => (
        <>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your personal information</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                    <User stroke="#6B7280" width={20} height={20} />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    maxLength={50}
                    selectionColor="#3B82F6"
                />
            </View>

            {/* Mobile Input */}
            <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                    <Phone stroke="#6B7280" width={20} height={20} />
                </View>
                <TextInput
                    ref={mobileInputRef}
                    style={styles.input}
                    placeholder="Mobile Number"
                    placeholderTextColor="#9CA3AF"
                    value={mobile}
                    onChangeText={(text) => setMobile(text.replace(/\D/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                    selectionColor="#3B82F6"
                    editable={!otpSent}
                />
                {mobileChanged && (
                    <View style={styles.changeIndicator}>
                        <Text style={styles.changeIndicatorText}>Changed</Text>
                    </View>
                )}
            </View>

            <Text style={styles.infoText}>
                {mobileChanged
                    ? 'A verification OTP will be sent to your new mobile number.'
                    : 'Leave mobile empty if you don\'t want to change it.'}
            </Text>
        </>
    );

    const renderOtpStep = () => (
        <>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToForm}>
                <ArrowLeft stroke="#6B7280" width={20} height={20} />
            </TouchableOpacity>

            <Text style={styles.title}>Verify Mobile</Text>
            <Text style={styles.subtitle}>
                Enter the 4-digit OTP sent to {'\n'}
                <Text style={styles.mobileText}>+91 {storedNewMobile}</Text>
            </Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
                <TextInput
                    ref={otpInputRef}
                    style={styles.otpInput}
                    placeholder="Enter OTP"
                    placeholderTextColor="#9CA3AF"
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    selectionColor="#3B82F6"
                    textAlign="center"
                />
            </View>

            {/* Resend OTP */}
            <TouchableOpacity
                style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
                onPress={handleResendOtp}
                disabled={countdown > 0}
            >
                <Text style={styles.resendText}>
                    {countdown > 0
                        ? `Resend OTP in ${countdown}s`
                        : 'Resend OTP'}
                </Text>
            </TouchableOpacity>
        </>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.backdrop}
        >
            <TouchableOpacity
                style={styles.backdropTouchable}
                activeOpacity={1}
                onPress={onClose}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <X stroke="#6B7280" width={20} height={20} />
                        </TouchableOpacity>

                        {/* Error message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Form or OTP step */}
                        {step === 'form' ? renderFormStep() : renderOtpStep()}

                        {/* Update Button */}
                        <TouchableOpacity
                            style={[
                                styles.updateButton,
                                (loading || (mobileChanged && step === 'form' && otpSent)) && styles.updateButtonDisabled
                            ]}
                            onPress={handleUpdate}
                            disabled={loading || (mobileChanged && step === 'form' && otpSent)}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    {/* <Check stroke="#FFFFFF" width={20} height={20} /> */}
                                    <Text style={styles.updateButtonText}>
                                        {step === 'form' ? 'Update Profile' : 'Verify & Update'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropTouchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: width * 0.9,
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    mobileText: {
        fontWeight: '600',
        color: '#1F2937',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 14,
        fontWeight: '500',
    },
    changeIndicator: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    changeIndicatorText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    otpContainer: {
        width: '100%',
        marginBottom: 16,
    },
    otpInput: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#3B82F6',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    resendButton: {
        marginBottom: 24,
    },
    resendButtonDisabled: {
        opacity: 0.5,
    },
    resendText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    infoText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 18,
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    updateButtonDisabled: {
        opacity: 0.7,
    },
    updateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center',
    },
});

export default EditProfileModal;