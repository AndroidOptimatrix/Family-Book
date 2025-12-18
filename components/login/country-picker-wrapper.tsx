import React from 'react';
import { Platform } from 'react-native';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';

interface CountryPickerWrapperProps {
  visible: boolean;
  countryCode: string;
  onSelect: (countryCode: string, callingCode: string) => void;
  onClose: () => void;
}

const CountryPickerWrapper: React.FC<CountryPickerWrapperProps> = ({
  visible,
  countryCode,
  onSelect,
  onClose,
}) => {
  return (
    <CountryPicker
      visible={visible}
      countryCode={countryCode as CountryCode}
      withCallingCode={true}
      withCallingCodeButton={true}
      withCurrencyButton={false}
      withFlagButton={true}
      withAlphaFilter={true}
      withFilter={true}
      withEmoji={true}
      onSelect={(country) => {
        onSelect(country.cca2, country.callingCode[0]);
      }}
      onClose={onClose}
      containerButtonStyle={{ display: 'none' }}
      theme={{
        backgroundColor: '#FFFFFF',
        onBackgroundTextColor: '#1F2937',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        filterPlaceholderTextColor: '#6B7280',
        activeOpacity: 0.7,
        itemHeight: 50,
        flagSize: 24,
      }}
      modalProps={{
        visible: visible,
        animationType: 'slide',
        transparent: true,
      }}
    />
  );
};

export default CountryPickerWrapper;