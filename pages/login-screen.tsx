import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  onNavigateToRegister 
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const handleLogin = async (): Promise<void> => {
    if (!email) {
      Alert.alert('Error', `Please enter your ${loginMethod}`);
      return;
    }
    
    if (loginMethod === 'email' && !password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Decorative Circle */}
          <View style={styles.topCircle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to your account</Text>
          </View>

          {/* Login Method Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'email' && styles.toggleActive
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Text style={[
                styles.toggleText,
                loginMethod === 'email' && styles.toggleActiveText
              ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'phone' && styles.toggleActive
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text style={[
                styles.toggleText,
                loginMethod === 'phone' && styles.toggleActiveText
              ]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email/Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </Text>
              <View style={styles.inputContainer}>
                {loginMethod === 'email' ? (
                  <MaterialIcons name="email" size={22} color="#6366F1" style={styles.inputIcon} />
                ) : (
                  <MaterialIcons name="phone" size={22} color="#6366F1" style={styles.inputIcon} />
                )}
                <TextInput
                  style={styles.textInput}
                  placeholder={loginMethod === 'email' ? 'john@example.com' : '+1 234 567 8900'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Password Input (only for email) */}
            {loginMethod === 'email' && (
              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Reset password feature would go here')}>
                    <Text style={styles.forgotPassword}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock" size={22} color="#6366F1" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <MaterialIcons name="visibility-off" size={22} color="#6B7280" />
                    ) : (
                      <MaterialIcons name="visibility" size={22} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Remember Me & Biometric */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked
                ]}>
                  {rememberMe && <MaterialIcons name="check" size={14} color="white" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.biometricContainer}>
                <MaterialIcons name="fingerprint" size={20} color="#6366F1" />
                <Text style={styles.biometricText}>Use Biometric</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={26} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="twitter" size={26} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="instagram" size={26} color="#E4405F" />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={onNavigateToRegister}
            >
              <Text style={styles.signupButtonText}>Sign Up Now</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  topCircle: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 300,
    height: 300,
    backgroundColor: '#E0E7FF',
    borderRadius: 150,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  toggleActiveText: {
    color: '#6366F1',
  },
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  eyeButton: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  rememberText: {
    fontSize: 14,
    color: '#6B7280',
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    marginRight: 6,
  },
  arrow: {
    fontSize: 18,
    color: '#6366F1',
  },
});

export default LoginScreen;