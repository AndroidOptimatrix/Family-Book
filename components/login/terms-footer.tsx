import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TermsFooter: React.FC = () => {
  return (
    <View style={styles.termsContainer}>
      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText}>Terms</Text> &{' '}
        <Text style={styles.linkText}>Privacy</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#0400ffff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default TermsFooter;