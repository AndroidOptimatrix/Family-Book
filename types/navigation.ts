import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: { 
    email?: string; 
    phone?: string; 
    method?: 'email' | 'phone' 
  };
  ForgotPassword: undefined;
  Home: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type OTPScreenProps = NativeStackScreenProps<RootStackParamList, 'OTP'>;