export interface AuthContextType {
    isAuthenticated: boolean;
}

export interface LoginData {
    user_id: string;
    user_name: string;
    user_image: string;
    device_id: string | null;
    mobile: string;
    last_update_profile: string;
    result: string;
    msg: string;
}

export interface LoginResgister {
    result: string;
    OTP: number;
    msg: string;
    user_id: string;
    login?: boolean;
    register?: boolean;
}

export interface VerifyOtpRegister {
    sms_result: string;
    sms_msg: string;
    result: string;
    msg: string;
}

export interface CompleteRegistration {
    result: string;
    msg: string;
    user_id: string;
    name: string;
    mobile: string;
}