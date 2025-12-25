import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Menu, Bell } from 'react-native-feather';
import LinearGradient from 'react-native-linear-gradient';
import { AppThemeGradient } from '../../config/config';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface HeaderProps {
  onMenuPress: () => void;
  logoSource: any;
}

// Define your navigation types
type RootStackParamList = {
  DashboardMain: undefined;
  Notifications: undefined;
};

const Header: React.FC<HeaderProps> = ({ 
  onMenuPress, 
  logoSource,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Function to calculate top padding based on platform and version
  const getTopPadding = () => {
    if (Platform.OS === 'ios') {
      // For iOS, use status bar height + some padding
      return (StatusBar.currentHeight || 44) + 8;
    }
    
    // For Android
    const androidVersion = Platform.Version;
    
    if (androidVersion as number >= 30) { // Android 11+ (API 30)
      // Android 15+ (API 35) would be androidVersion >= 35
      // For edge-to-edge support on Android 11+
      return (StatusBar.currentHeight || 24) + 8;
    } else {
      // For older Android versions
      return (StatusBar.currentHeight || 24) + 4;
    }
  };

  const handleNotificationPress = () => {
    // Navigate to Notifications screen
    navigation.navigate('Notifications');
  };

  return (
    <LinearGradient 
      angle={50} 
      useAngle 
      colors={AppThemeGradient} 
      style={[
        styles.header, 
        { 
          backgroundColor: 'rgba(240, 253, 252, 1)',
          paddingTop: getTopPadding(),
        }
      ]}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Menu stroke="#1F2937" width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image
            source={logoSource}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNotificationPress}
          >
            <Bell stroke="#1F2937" width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 200,
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'rgba(240, 253, 252, 1)', // Match gradient background
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Header;