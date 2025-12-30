// useProfile.ts
import { useState } from 'react'
import { makeApiCall } from '../utils/http-helper';

interface UpdateProfileResponse {
    result: string;
    msg: string;
    user_id?: string;
    requires_verification?: boolean;
    otp_sent?: boolean;
    name_updated?: boolean;
    mobile_updated?: boolean;
    updated_data?: {
        name: string;
        mobile: string;
        last_updated: string;
    };
}

interface UseProfileReturn {
    data: UpdateProfileResponse | null;
    loading: boolean;
    error: string | null;
    updateUserProfile: (
        userId: string, 
        userName?: string, 
        newMobile?: string, 
        otp?: string
    ) => Promise<UpdateProfileResponse>;
    clearError: () => void;
}

const useProfile = (): UseProfileReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<UpdateProfileResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function updateUserProfile(
        userId: string, 
        userName?: string, 
        newMobile?: string, 
        otp?: string
    ): Promise<UpdateProfileResponse> {
        setLoading(true);
        setError(null);
        
        try {
            // Prepare parameters
            const params: any = {
                type: 'update_user_profile',
                user_id: userId,
            };

            // Add name if provided
            if (userName && userName.trim() !== '') {
                params.name = userName.trim();
            }

            // Add mobile if provided
            if (newMobile && newMobile.trim() !== '') {
                params.new_mobile = newMobile.trim();
            }

            // Add OTP if provided
            if (otp && otp.trim() !== '') {
                params.otp = otp.trim();
            }

            // Check if at least name or mobile is provided
            if (!params.name && !params.mobile) {
                throw new Error('Please provide name or mobile to update');
            }

            const response = await makeApiCall('', params);
            
            if (response.DATA && response.DATA[0]) {
                const result = response.DATA[0];
                setData(result);
                
                // Check if the response indicates an error
                if (result.result === 'fail') {
                    throw new Error(result.msg);
                }
                
                return result;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Something went wrong';
            setError(errorMessage);
            console.log("Update profile error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const clearError = () => {
        setError(null);
    };

    return {
        data,
        loading,
        error,
        updateUserProfile,
        clearError
    }
}

export default useProfile;