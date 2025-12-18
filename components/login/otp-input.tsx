import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface OTPInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChangeText, editable = true }) => {
  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').substring(0, 4);
    onChangeText(cleaned);
  };

  return (
    <View style={styles.otpInputContainer}>
      <TextInput
        style={styles.otpInput}
        placeholder="Enter OTP"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={handleOtpChange}
        keyboardType="number-pad"
        maxLength={4}
        textAlign="center"
        editable={editable}
        selectionColor="#3B82F6"
        secureTextEntry={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  otpInputContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  otpInput: {
    width: 200,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  otpHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default OTPInput;