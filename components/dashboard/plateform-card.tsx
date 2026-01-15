// PlatformCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform as RNPlatform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Platform } from '../../types/dashboard.types';

interface PlatformCardProps {
  platform: Platform;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform }) => {
  const Icon = platform.icon;
  
  const handlePress = () => {
    if (!platform.url || platform.url === '#' || platform.url === '') {
      Alert.alert('No URL', `No link available for ${platform.name}`);
      return;
    }
    
    let urlToOpen = platform.url.trim();
    console.log(`Attempting to open: ${urlToOpen} for ${platform.name}`);
    
    // For iOS, try app-specific schemes first
    if (RNPlatform.OS === 'ios') {
      const platformName = platform.name.toLowerCase();
      
      if (platformName.includes('instagram')) {
        // Try Instagram app scheme
        const instagramAppUrl = urlToOpen.replace('https://www.instagram.com/', 'instagram://user?username=');
        console.log('Trying Instagram app URL:', instagramAppUrl);
        
        Linking.openURL(instagramAppUrl).catch(() => {
          // If app not installed, open in browser
          console.log('Instagram app not found, opening in browser');
          Linking.openURL(urlToOpen).catch((error) => {
            console.error('Failed to open Instagram URL:', error);
            showURLError(platform.name, urlToOpen);
          });
        });
        return;
      }
      
      if (platformName.includes('facebook')) {
        // Try Facebook app scheme
        const facebookAppUrl = urlToOpen.replace('https://www.facebook.com/', 'fb://profile/');
        console.log('Trying Facebook app URL:', facebookAppUrl);
        
        Linking.openURL(facebookAppUrl).catch(() => {
          // If app not installed, open in browser
          console.log('Facebook app not found, opening in browser');
          Linking.openURL(urlToOpen).catch((error) => {
            console.error('Failed to open Facebook URL:', error);
            showURLError(platform.name, urlToOpen);
          });
        });
        return;
      }
      
      if (platformName.includes('youtube')) {
        // Try YouTube app scheme
        const youtubeAppUrl = urlToOpen.replace('https://www.youtube.com/', 'youtube://');
        console.log('Trying YouTube app URL:', youtubeAppUrl);
        
        Linking.openURL(youtubeAppUrl).catch(() => {
          // If app not installed, open in browser
          console.log('YouTube app not found, opening in browser');
          Linking.openURL(urlToOpen).catch((error) => {
            console.error('Failed to open YouTube URL:', error);
            showURLError(platform.name, urlToOpen);
          });
        });
        return;
      }
    }
    
    // For Android and other platforms, just try to open the URL
    // Don't use canOpenURL() - it often returns false incorrectly
    Linking.openURL(urlToOpen).catch((error) => {
      console.error(`Failed to open ${platform.name} URL:`, error);
      showURLError(platform.name, urlToOpen);
    });
  };
  
  const showURLError = (platformName: string, url: string) => {
    Alert.alert(
      'Cannot Open Link',
      `Could not open ${platformName}. You can manually visit:\n\n${url}`,
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Open in Browser',
          onPress: () => {
            // Try one more time with error handling
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'Please copy the URL and open it manually in your browser.');
            });
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.platformCardWrapper}
      onPress={handlePress}
      activeOpacity={0.8}
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
    minHeight: 100,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  platformIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
});

export default PlatformCard;