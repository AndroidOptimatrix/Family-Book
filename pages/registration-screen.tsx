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
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  User,
  Phone,
  ChevronRight,
  MapPin,
  Home,
  Hash,
  Check
} from 'react-native-feather';

const { width, height } = Dimensions.get('window');

interface RegisterScreenProps {
  onBack: () => void;
  onRegisterSuccess: (phone: string) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBack,
  onRegisterSuccess,
}) => {
  const [formData, setFormData] = useState({
    surname: '',
    yourName: '',
    fatherName: '',
    gender: '',
    maritalStatus: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    mobileNumber: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const genders = ['Male', 'Female', 'Other'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];

  const handleRegister = async (): Promise<void> => {
    // Check required fields
    const requiredFields = ['surname', 'yourName', 'fatherName', 'gender', 'maritalStatus', 'mobileNumber'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate mobile number
    const numericPhone = formData.mobileNumber.replace(/[^0-9]/g, '');
    if (numericPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number (10 digits minimum)');
      return;
    }

    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess(formData.mobileNumber);
    }, 1500);
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhoneNumberChange = (text: string) => {
    // Format phone number
    const cleaned = text.replace(/[^0-9+]/g, '');

    // If user starts typing, ensure + is at the beginning
    let formatted = cleaned;

    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }

    // Remove extra plus signs
    formatted = '+' + formatted.replace(/[^0-9]/g, '');

    // Indian format
    if (formatted.startsWith('+91')) {
      const digits = formatted.substring(3);
      if (digits.length > 0) {
        formatted = '+91 ' + digits;
        if (digits.length > 5) {
          formatted = '+91 ' + digits.substring(0, 5) + ' ' + digits.substring(5);
        }
        if (digits.length > 10) {
          formatted = '+91 ' + digits.substring(0, 5) + ' ' + digits.substring(5, 10);
        }
      }
    } else {
      const countryCode = formatted.match(/^\+\d+/)?.[0] || '';
      const digits = formatted.substring(countryCode.length);

      let formattedDigits = '';
      for (let i = 0; i < digits.length; i++) {
        if (i > 0 && i % 3 === 0) formattedDigits += ' ';
        formattedDigits += digits[i];
      }

      formatted = countryCode + (formattedDigits ? ' ' + formattedDigits : '');
    }

    if (formatted.length > 20) {
      formatted = formatted.substring(0, 20);
    }

    updateField('mobileNumber', formatted);
  };

  const RadioButton = ({ label, selected, onSelect, disabled }: { 
    label: string; 
    selected: boolean; 
    onSelect: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.radioContainer,
        selected && styles.radioContainerSelected,
        disabled && styles.radioContainerDisabled
      ]}
      onPress={onSelect}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.radioOuter}>
        {selected && (
          <View style={styles.radioInner}>
            <Check stroke="#FFFFFF" width={12} height={12} />
          </View>
        )}
      </View>
      <Text style={[
        styles.radioLabel,
        selected && styles.radioLabelSelected,
        disabled && styles.radioLabelDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#F59E0B', '#EF4444']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBack}
                  disabled={isLoading}
                >
                  <ArrowLeft stroke="white" width={24} height={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                  <User stroke="white" width={32} height={32} />
                  <Text style={styles.headerTitle}>Create Account</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>Join FamilyBook Today</Text>
              <Text style={styles.headerDescription}>Fill in your family details</Text>
            </View>

            {/* Registration Form Card */}
            <View style={styles.formCard}>
              {/* Personal Information Section */}
              <Text style={styles.sectionTitle}>Personal Information</Text>

              {/* Surname */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Surname <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <User stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your surname"
                    value={formData.surname}
                    onChangeText={(text) => updateField('surname', text)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Your Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Your Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <User stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    value={formData.yourName}
                    onChangeText={(text) => updateField('yourName', text)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Father's Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Father's Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <User stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChangeText={(text) => updateField('fatherName', text)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.radioGroup}>
                  {genders.map((gender) => (
                    <RadioButton
                      key={gender}
                      label={gender}
                      selected={formData.gender === gender}
                      onSelect={() => updateField('gender', gender)}
                      disabled={isLoading}
                    />
                  ))}
                </View>
                {!formData.gender && (
                  <Text style={styles.radioError}>Please select your gender</Text>
                )}
              </View>

              {/* Marital Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Marital Status <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.radioGroup}>
                  {maritalStatuses.map((status) => (
                    <RadioButton
                      key={status}
                      label={status}
                      selected={formData.maritalStatus === status}
                      onSelect={() => updateField('maritalStatus', status)}
                      disabled={isLoading}
                    />
                  ))}
                </View>
                {!formData.maritalStatus && (
                  <Text style={styles.radioError}>Please select your marital status</Text>
                )}
              </View>

              {/* Contact Information Section */}
              <Text style={styles.sectionTitle}>Contact Information</Text>

              {/* Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Mobile Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Phone stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChangeText={handlePhoneNumberChange}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                    maxLength={20}
                  />
                </View>
              </View>

              {/* Address Information Section */}
              <Text style={styles.sectionTitle}>Address Information</Text>

              {/* City */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>City</Text>
                <View style={styles.inputContainer}>
                  <MapPin stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your city"
                    value={formData.city}
                    onChangeText={(text) => updateField('city', text)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* State */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State</Text>
                <View style={styles.inputContainer}>
                  <MapPin stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your state"
                    value={formData.state}
                    onChangeText={(text) => updateField('state', text)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Country */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Country</Text>
                <View style={styles.inputContainer}>
                  <MapPin stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your country"
                    value={formData.country}
                    onChangeText={(text) => updateField('country', text)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* ZIP Code */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ZIP Code</Text>
                <View style={styles.inputContainer}>
                  <Hash stroke="#3B82F6" width={20} height={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter ZIP code"
                    value={formData.zip}
                    onChangeText={(text) => updateField('zip', text)}
                    keyboardType="number-pad"
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
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
                      <Text style={styles.registerButtonText}>Create Account</Text>
                      <ChevronRight stroke="#FFFFFF" width={20} height={20} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Already have account */}
              <View style={styles.loginLinkContainer}>
                <Text style={[styles.loginText, isLoading && styles.disabledText]}>
                  Already have an account?
                </Text>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={onBack}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.loginButtonText, isLoading && styles.disabledText]}>
                    Sign In
                  </Text>
                  <ChevronRight stroke={isLoading ? "#9CA3AF" : "#f89807ff"} width={18} height={18} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms & Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By registering, you agree to our{' '}
                <Text style={styles.linkText}>Terms</Text> &{' '}
                <Text style={styles.linkText}>Privacy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
    fontWeight: '600',
  },
  headerDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    marginTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
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
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: width * 0.25,
  },
  radioContainerSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  radioContainerDisabled: {
    opacity: 0.6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  radioLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  radioLabelDisabled: {
    color: '#9CA3AF',
  },
  radioError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 10,
    marginBottom: 24,
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
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  loginText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  termsContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default RegisterScreen;