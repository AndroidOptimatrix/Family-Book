// context/auth-context.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { makeApiCall } from '../utils/http-helper';
import { ApiResponse } from '../types/api.types';

interface UserInfo {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    requiresRegistration: boolean;
    userInfo: UserInfo | null;
    userPhone: string | null;
    sendOtp: (mobile: string) => Promise<ApiResponse>;
    verifyOtp: (mobile: string, otp: string) => Promise<ApiResponse>;
    completeProfile: (name: string) => Promise<ApiResponse>;
    logout: () => Promise<void>;
    clearRegistrationRequirement: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
    onLoginSuccess?: (userInfo: UserInfo) => void;
    onRegistrationRequired?: (phoneNumber: string) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
    children,
    onLoginSuccess,
    onRegistrationRequired
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [requiresRegistration, setRequiresRegistration] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userPhone, setUserPhone] = useState<string | null>(null);

    // Check auth status on app start
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = await storage.getItem('@authenticated');
                const storedUserInfo = await storage.getItem('@user_info');
                const modelOpen = await storage.getItem('@model_open');

                console.log('🔍 Auth check on startup:', {
                    token: !!token,
                    modelOpen,
                    hasUserInfo: !!storedUserInfo
                });

                if (token) {
                    setIsAuthenticated(true);

                    if (storedUserInfo) {
                        const parsedInfo = typeof storedUserInfo === 'string'
                            ? JSON.parse(storedUserInfo)
                            : storedUserInfo;
                        setUserInfo(parsedInfo);
                    }

                    // If model_open is true, user needs to complete registration
                    // Handle both boolean true and string "true" from storage
                    const needsRegistration = modelOpen === true || modelOpen === "true";
                    if (needsRegistration) {
                        setRequiresRegistration(true);
                        if (storedUserInfo) {
                            const parsedInfo = typeof storedUserInfo === 'string'
                                ? JSON.parse(storedUserInfo)
                                : storedUserInfo;
                            if (parsedInfo.phone) {
                                setUserPhone(parsedInfo.phone);
                            }
                        }
                    } else if (modelOpen === false || modelOpen === "false") {
                        // User is already registered, perform background login
                        await performBackgroundLogin();
                    }
                } else {
                    setIsAuthenticated(false);
                    setRequiresRegistration(false);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Background login for already registered users
    const performBackgroundLogin = async (): Promise<void> => {
        try {
            // Get stored user info
            const storedUserInfo = await storage.getItem('@user_info');
            if (!storedUserInfo) {
                console.log('No user info found for background login');
                return;
            }

            const parsedInfo = typeof storedUserInfo === 'string'
                ? JSON.parse(storedUserInfo)
                : storedUserInfo;

            // Call login_otp API
            const params = {
                type: 'login_otp',
                user_id: parsedInfo.user_id || parsedInfo.id,
                otp_code: parsedInfo.otp, // API expects otp_code parameter
            };

            const data = await makeApiCall('', params);

            if (data.DATA?.[0]?.result === 'success') {
                console.log('✅ Background login successful');
                if (onLoginSuccess) {
                    onLoginSuccess(data.DATA[0]);
                }
            }
        } catch (error) {
            console.error('❌ Background login failed:', error);
            await logout();
        }
    };

    // Send OTP function
    const sendOtp = async (mobile: string): Promise<ApiResponse> => {
        try {
            setIsLoading(true);

            // Validate mobile number
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(mobile)) {
                throw new Error('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
            }

            console.log('📱 Sending OTP to mobile:', mobile);

            const params = {
                type: 'login_register',
                mobile: mobile,
            };

            const data = await makeApiCall('', params);

            // Check if we got a valid response
            if (!data.DATA || !Array.isArray(data.DATA) || data.DATA.length === 0) {
                console.error('❌ Empty DATA array in response:', data);
                throw new Error('Server returned empty response. Please try again.');
            }

            const firstItem = data.DATA[0];
            console.log('✅ First item in DATA:', firstItem);

            // Save user_id for OTP verification and store register flag in storage
            // IMPORTANT: DO NOT set requiresRegistration or userPhone here
            // The modal should only open AFTER OTP verification, not after sending OTP
            if (firstItem.user_id) {
                setUserId(firstItem.user_id.toString());
                const isRegister = firstItem.register === true;
                await storage.setItem('@model_open', isRegister);
                console.log('👤 User ID saved:', firstItem.user_id);
                console.log('📝 Register flag stored in storage:', isRegister, '(modal will open after OTP verification if true)');
            }

            // Ensure requiresRegistration is false at this point - modal should not open yet
            setRequiresRegistration(false);

            // Check if successful
            if (firstItem.result === 'success') {
                console.log('🎉 OTP Sent Successfully!');
                console.log('🔢 OTP (for testing):', firstItem.OTP);
                console.log('📝 Message:', firstItem.msg);
                return data;
            } else {
                const errorMsg = firstItem.msg || firstItem.otp_msg || 'Failed to send OTP';
                console.error('❌ API Error:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔥 Send OTP Error:', error);
            throw new Error(error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Verify OTP function
    // In your verifyOtp function in auth-context.tsx:
    const verifyOtp = async (mobile: string, otp: string): Promise<ApiResponse> => {
        try {
            setIsLoading(true);

            if (!userId) {
                throw new Error('Invalid User ID. Please try sending OTP again.');
            }

            if (!otp || otp.length !== 4) {
                throw new Error('Please enter a valid 4-digit OTP');
            }

            console.log('🔢 Verifying OTP:', otp, 'for user_id:', userId);

            const params = {
                type: 'verify_otp_register',
                user_id: userId,
                otp: otp,
            };

            const data = await makeApiCall('', params);

            console.log('✅ Verify OTP response:', data);

            if (data.DATA && data.DATA.length > 0) {
                const firstItem = data.DATA[0];

                if (firstItem.result === 'success') {
                    console.log('🎉 OTP Verified Successfully!');

                    // Store basic authentication
                    await storage.setItem('@authenticated', true);

                    // Get the stored model_open value
                    const modelOpen = await storage.getItem('@model_open');
                    console.log('📱 Model open from storage:', modelOpen);

                    // Store user info for background login
                    await storage.setItem('@user_info', {
                        user_id: userId,
                        phone: mobile,
                        otp: otp,
                    });

                    setIsAuthenticated(true);

                    // NOW check if user needs to complete registration (after OTP verification)
                    // This is when the modal should open, NOT after sending OTP
                    // Handle both boolean true and string "true" from storage
                    const needsRegistration = modelOpen === true || modelOpen === "true";
                    if (needsRegistration) {
                        console.log('📝 User needs to complete registration - opening modal now');
                        setUserPhone(mobile); // Set phone number for modal display
                        setRequiresRegistration(true); // This will trigger the modal to open

                        // IMPORTANT: Call the callback to notify parent component
                        if (onRegistrationRequired) {
                            console.log('🚀 Calling onRegistrationRequired callback');
                            onRegistrationRequired(mobile);
                        }
                    } else {
                        console.log('✅ User is already registered, performing login...');
                        // User is already registered, perform login directly (no modal needed)
                        await performLoginAfterOtp(userId, otp);
                    }

                    return data;
                } else {
                    const errorMsg = firstItem.msg || firstItem.otp_msg || 'OTP verification failed';
                    console.error('❌ OTP Verification Error:', errorMsg);
                    throw new Error(errorMsg);
                }
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('🔥 Verify OTP Error:', error);
            throw new Error(error.message || 'OTP verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Perform login after OTP verification (for already registered users)
    const performLoginAfterOtp = async (userId: string, otp: string): Promise<void> => {
        try {
            console.log('🔄 Performing login after OTP...');

            const params = {
                type: 'login_otp',
                user_id: userId,
                otp_code: otp, // API expects otp_code parameter
            };

            const data = await makeApiCall('', params);

            console.log('✅ Login response:', data);

            if (data.DATA && data.DATA.length > 0) {
                const firstItem = data.DATA[0];

                if (firstItem.result === 'success') {
                    console.log('✅ Login successful');

                    // Update storage
                    await storage.setItem('@user_info', firstItem);
                    await storage.setItem('@model_open', false);

                    // Update state
                    setUserInfo(firstItem);

                    // Call success callback
                    if (onLoginSuccess) {
                        onLoginSuccess(firstItem);
                    }
                } else {
                    throw new Error(firstItem.msg || 'Login failed');
                }
            }
        } catch (error: any) {
            console.error('🔥 Login Error:', error);
            throw error;
        }
    };

    // Complete profile function
    // Flow: 1. Send complete_registration request 2. Then perform background login_otp
    const completeProfile = async (name: string): Promise<ApiResponse> => {
        try {
            setIsLoading(true);

            if (!userId) {
                throw new Error('Invalid User ID. Please try again.');
            }

            console.log('📝 Step 1: Completing profile for user_id:', userId, 'with name:', name);

            // Extract just the mobile number without country code for API
            let mobileNumber = userPhone || '';
            if (mobileNumber) {
                // Remove any non-digit characters
                mobileNumber = mobileNumber.replace(/\D/g, '');
                // Remove country code if present (e.g., "918141561118" -> "8141561118")
                // Assuming country code is 2 digits (91 for India)
                if (mobileNumber.length > 10 && mobileNumber.startsWith('91')) {
                    mobileNumber = mobileNumber.substring(2);
                }
            }

            // Step 1: Send complete_registration request
            const params = {
                type: 'complete_registration',
                mobile: mobileNumber,
                name: name,
            };

            const data = await makeApiCall('', params);

            console.log('✅ Complete Profile response:', data);

            if (data.DATA && data.DATA.length > 0) {
                const firstItem = data.DATA[0];
                if (firstItem.result === 'success') {
                    console.log('🎉 Profile completed successfully');

                    // Step 2: Now perform background login after profile completion
                    await performLoginAfterProfile(userId);

                    return data;
                } else {
                    const errorMsg = firstItem.msg || 'Failed to complete profile';
                    throw new Error(errorMsg);
                }
            } else {
                throw new Error('Invalid response from server while completing profile');
            }
        } catch (error: any) {
            console.error('🔥 Complete Profile Error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Perform background login after profile completion
    // This is Step 2: Send login_otp request in background
    const performLoginAfterProfile = async (userId: string): Promise<void> => {
        try {
            // Get stored OTP from user info
            const storedUserInfo = await storage.getItem('@user_info');
            if (!storedUserInfo) {
                throw new Error('No user info found');
            }

            const parsedInfo = typeof storedUserInfo === 'string'
                ? JSON.parse(storedUserInfo)
                : storedUserInfo;

            console.log('🔄 Step 2: Performing background login after profile completion...');

            const params = {
                type: 'login_otp',
                user_id: userId,
                otp_code: parsedInfo.otp, // API expects otp_code parameter
            };

            const data = await makeApiCall('', params);

            console.log('✅ Login after profile response:', data);

            if (data.DATA && data.DATA.length > 0) {
                const firstItem = data.DATA[0];

                if (firstItem.result === 'success') {
                    console.log('✅ Login successful after profile');

                    // Update storage
                    await storage.setItem('@user_info', firstItem);
                    await storage.setItem('@model_open', false);

                    // Update state
                    setRequiresRegistration(false);
                    setUserInfo(firstItem);

                    // Call success callback
                    if (onLoginSuccess) {
                        onLoginSuccess(firstItem);
                    }
                } else {
                    throw new Error(firstItem.msg || 'Login failed');
                }
            }
        } catch (error: any) {
            console.error('🔥 Login after profile Error:', error);
            throw error;
        }
    };

    // Clear registration requirement (manual override)
    const clearRegistrationRequirement = (): void => {
        setRequiresRegistration(false);
        storage.setItem('@model_open', false);
    };

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            await storage.removeItem('@authenticated');
            await storage.removeItem('@user_info');
            await storage.removeItem('@model_open');

            setUserId(null);
            setUserPhone(null);
            setUserInfo(null);
            setRequiresRegistration(false);
            setIsAuthenticated(false);

            console.log('👋 User logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        requiresRegistration,
        userInfo,
        userPhone,
        sendOtp,
        verifyOtp,
        completeProfile,
        logout,
        clearRegistrationRequirement
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;