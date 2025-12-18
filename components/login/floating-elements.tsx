import React from 'react';
import { View, StyleSheet } from 'react-native';

const FloatingElements: React.FC = () => {
  return (
    <>
      <View style={styles.floatingCircle1} />
      <View style={styles.floatingCircle2} />
      <View style={styles.floatingCircle3} />
    </>
  );
};

const styles = StyleSheet.create({
  floatingCircle1: {
    position: 'absolute',
    top: '15%',
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  floatingCircle2: {
    position: 'absolute',
    bottom: '20%',
    right: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  floatingCircle3: {
    position: 'absolute',
    top: '35%',
    right: '12%',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
});

export default FloatingElements;