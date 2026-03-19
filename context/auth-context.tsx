import { storage } from '../utils/storage';
import { ApiResponse } from '../types/api.types';
import { makeApiCall } from '../utils/http-helper';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { setStoredUserId, getStoredUserId } from '../utils/storage';
import { syncFCMToken } from '../utils/fcm-helper';
import { Platform } from 'react-native';
import { removeItem } from '../utils/storage';

interface UserInfo {
    id: string;
    user_name?: string;
    mobile?: string;
    user_id?: string;
    [key: string]: any;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    requiresRegistration: boolean;
    userInfo: UserInfo | null;
    userPhone: string | null;
    sendOtp: (mobile: string, country_code: string) => Promise<ApiResponse>;
    verifyOtp: (mobile: string, otp: string, isRegistering?: boolean) => Promise<ApiResponse>;
    completeProfile: (name: string) => Promise<ApiResponse>;
    logout: () => Promise<void>;
    updateUserInfo: (updatedInfo: Partial<UserInfo>) => Promise<void>;
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
                const storedUserId = await getStoredUserId(); // Get stored user ID

                if (storedUserId) {
                    setUserId(storedUserId);
                }

                if (token) {
                    setIsAuthenticated(true);

                    if (storedUserInfo) {
                        const parsedInfo = typeof storedUserInfo === 'string'
                            ? JSON.parse(storedUserInfo)
                            : storedUserInfo;
                        setUserInfo(parsedInfo);
                    }

                    // If model_open is true, user needs to complete registration
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

                        // Also update device token in background for existing users
                        if (storedUserId) {
                            setTimeout(() => {
                                syncFCMToken(storedUserId);
                            }, 2000);
                        }
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
                return;
            }

            const parsedInfo = typeof storedUserInfo === 'string'
                ? JSON.parse(storedUserInfo)
                : storedUserInfo;

            // Call login_otp API
            const params = {
                type: 'login_otp',
                user_id: parsedInfo.user_id || parsedInfo.id,
                otp_code: parsedInfo.otp,
            };

            const data = await makeApiCall('', params);

            if (data.DATA?.[0]?.result === 'success') {
                if (onLoginSuccess) {
                    onLoginSuccess(data.DATA[0]);
                }
            }
        } catch (error) {
            console.error('❌ Background login failed:', error);
            await logout();
        }
    };

    // Send OTP function - Updated to store user ID
    const sendOtp = async (mobile: string, country_code: string): Promise<ApiResponse> => {
        try {
            setIsLoading(true);

            // Validate mobile number
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(mobile)) {
                throw new Error('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
            }

            const params = {
                type: 'login_register',
                mobile: mobile,
                country_code: country_code
            };

            const data = await makeApiCall('', params);

            // Check if we got a valid response
            if (!data.DATA || !Array.isArray(data.DATA) || data.DATA.length === 0) {
                console.error('❌ Empty DATA array in response:', data);
                throw new Error('Server returned empty response. Please try again.');
            }

            const firstItem = data.DATA[0];

            if (firstItem.user_id) {
                const userIdStr = firstItem.user_id.toString();
                setUserId(userIdStr);
                // Store user ID for FCM updates
                await setStoredUserId(userIdStr);
                const isRegister = firstItem.register === true;
                await storage.setItem('@model_open', isRegister);
            }

            // Ensure requiresRegistration is false at this point
            setRequiresRegistration(false);

            // Check if successful
            if (firstItem.result === 'success') {
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

    // Verify OTP function - Updated to trigger FCM token update
    const verifyOtp = async (mobile: string, otp: string, isRegistering?: boolean): Promise<ApiResponse> => {
        try {
            setIsLoading(true);

            // Get the stored model_open value
            const modelOpen = await storage.getItem('@model_open');

            if (!userId) {
                throw new Error('Invalid User ID. Please try sending OTP again.');
            }

            if (!otp || otp.length !== 4) {
                throw new Error('Please enter a valid 4-digit OTP');
            }
            const params = {
                type: 'verify_otp_register',
                user_id: userId,
                otp: otp,
                isRegistering: modelOpen === true ? 'true' : 'false',
            };

            const data = await makeApiCall('', params);

            if (data.DATA && data.DATA.length > 0) {
                const firstItem = data.DATA[0];

                if (firstItem.result === 'success') {
                    // Store basic authentication
                    await storage.setItem('@authenticated', true);

                    // Store user info for background login
                    await storage.setItem('@user_info', {
                        user_id: userId,
                        phone: mobile,
                        otp: otp,
                    });

                    setIsAuthenticated(true);

                    // Trigger FCM token update in background
                    setTimeout(async () => {
                        try {
                            const updated = await syncFCMToken(userId);
                            console.log('📱 FCM token update after OTP:', updated ? 'Success' : 'Failed');
                        } catch (error) {
                            console.error('FCM token update error:', error);
                        }
                    }, 1000);

                    // Check if user needs to complete registration
                    const needsRegistration = modelOpen === true || modelOpen === "true";
                    if (needsRegistration) {
                        setUserPhone(mobile);
                        setRequiresRegistration(true);

                        if (onRegistrationRequired) {
                            onRegistrationRequired(mobile);
                        }
                    } else {
                        console.log('✅ User is already registered, performing login...');
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
            console.log('🔄 Performing login after OTP...', userId);

            const params = {
                type: 'login_otp',
                user_id: userId,
                otp_code: otp,
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

    // Complete profile function - Updated to trigger FCM token update
    const completeProfile = async (name: string): Promise<ApiResponse> => {
        try {
            setIsLoading(true);

            if (!userId) {
                throw new Error('Invalid User ID. Please try again.');
            }

            console.log('📝 Step 1: Completing profile for user_id:', userId, 'with name:', name);

            let mobileNumber = userPhone || '';
            if (mobileNumber) {
                mobileNumber = mobileNumber.replace(/\D/g, '');
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

                    // Trigger FCM token update after profile completion
                    setTimeout(async () => {
                        try {
                            const updated = await syncFCMToken(userId);
                            console.log('📱 FCM token update after profile:', updated ? 'Success' : 'Failed');
                        } catch (error) {
                            console.error('FCM token update error:', error);
                        }
                    }, 1000);

                    // Step 2: Perform background login
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
                otp_code: parsedInfo.otp,
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

    // Clear registration requirement
    const clearRegistrationRequirement = (): void => {
        setRequiresRegistration(false);
        storage.setItem('@model_open', false);
    };

    // Logout function - Updated to clear user ID but keep FCM token
    const logout = async (): Promise<void> => {
        try {
            await storage.removeItem('@authenticated');
            await storage.removeItem('@user_info');
            await storage.removeItem('@model_open');

            await removeItem('@user_id' as any);

            setUserId(null);
            setUserPhone(null);
            setUserInfo(null);
            setRequiresRegistration(false);
            setIsAuthenticated(false);

            console.log('👋 User logged out successfully (FCM token preserved)');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Update user info
    const updateUserInfo = async (updatedInfo: Partial<UserInfo>): Promise<void> => {
        try {
            if (!userInfo) {
                throw new Error('No user info available to update');
            }

            const newUserInfo = {
                ...userInfo,
                ...updatedInfo
            };

            console.log('Updating user info in AsyncStorage:', newUserInfo);

            // Update AsyncStorage
            await storage.setItem('@user_info', newUserInfo);

            // Update state
            setUserInfo(newUserInfo);

            console.log('✅ User info updated successfully in AsyncStorage');
        } catch (error) {
            console.error('🔥 Error updating user info:', error);
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
        updateUserInfo,
        clearRegistrationRequirement
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;