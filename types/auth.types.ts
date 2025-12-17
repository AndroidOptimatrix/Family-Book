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

/**
 * login_register&mobile=8141961116
 * {
    "DATA": [
        {
            "result": "success",
            "OTP": 4269,
            "msg": "OTP Sent on your Mobile Number.!",
            "user_id": "7",
            "login": true
        }
    ]
}

verify_otp_register&user_id=7&otp=4160
{
    "DATA": [
        {
            "sms_result": "success",
            "sms_msg": "SMS Sent Successfully!",
            "result": "success",
            "msg": "OTP Verification Successfully"
        }
    ]
}

complete_registration&mobile=8141961116&name=ahdemo
{
    "DATA": [
        {
            "result": "success",
            "msg": "Registration completed successfully",
            "user_id": "7",
            "name": "ahdemo",
            "mobile": "8141961116"
        }
    ]
}

login_otp&user_id=7&otp_code=4160
{
    "DATA": [
        {
            "user_id": "7",
            "user_name": "Ahdemo  ",
            "user_image": "https://www.demo.optiinfo.com/project/saraswatshakti/admin/images/m_icon.png",
            "device_id": null,
            "mobile": "8141961116",
            "last_update_profile": "17-12-2025 02:15 PM",
            "result": "success",
            "msg": "Login successfully"
        }
    ]
}
 */