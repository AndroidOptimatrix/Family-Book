// PlatformCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Platform } from '../../types/dashboard.types';

interface PlatformCardProps {
  platform: Platform;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform }) => {
  const Icon = platform.icon;
  
  const handlePress = async () => {
    try {
      // For demonstration, we'll just show an alert
      // In real app, you would use Linking.openURL(platform.url)
      Alert.alert(
        'Open Social Media',
        `Would you like to open ${platform.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => console.log(`Opening ${platform.url}`) }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to open link.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.platformCardWrapper}
      onPress={handlePress}
    >
      <LinearGradient
        colors={platform.gradient}
        style={styles.platformCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.platformIconContainer}>
          <Icon stroke="#FFFFFF" width={20} height={20} />
        </View>
        <View style={styles.platformInfo}>
          <Text style={styles.platformName}>{platform.name}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  platformCardWrapper: {
    flex: 1,
  },
  platformCard: {
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 20,
    paddingBlock: 10
  },
  platformIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  platformInfo: {
    alignItems: 'center',
  },
  platformName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // platformHandle: {
  //   fontSize: 12,
  //   color: 'rgba(255, 255, 255, 0.9)',
  //   marginBottom: 4,
  //   textAlign: 'center',
  // },
  // platformFollowers: {
  //   fontSize: 11,
  //   color: 'rgba(255, 255, 255, 0.7)',
  //   textAlign: 'center',
  // },
});

export default PlatformCard;