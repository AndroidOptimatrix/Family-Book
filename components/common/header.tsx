import React from 'react'
import { AppThemeGradient } from '../../config/config'
import { ArrowLeft, Edit2 } from 'react-native-feather'
import LinearGradient from 'react-native-linear-gradient'
import { 
  Platform, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text,
  StatusBar 
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

const LinearHeader = ({ 
  title, 
  subtitle, 
  isProfile,
  openProfile 
}: { 
  title: string, 
  subtitle?: string, 
  isProfile?: boolean,
  openProfile?: () => void
}) => {
  const navigation = useNavigation();

  const getTopPadding = () => {
    if (Platform.OS === 'ios') {
      // iOS: Use status bar height + padding
      const statusBarHeight = StatusBar.currentHeight || 44;
      return statusBarHeight + 8;
    }
    
    // Android: Handle different versions properly
    const androidVersion = Platform.Version;
    
    // For Android 11 and older (API 30 and below)
    if (typeof androidVersion === 'number' && androidVersion <= 30) {
      // Older Android versions have system status bar area
      // Use smaller fixed value
      return 12; // Reduced from 24+8=32 to just 12
    }
    
    // Android 12+ (API 31+): Edge-to-edge support
    return (StatusBar.currentHeight || 24) + 8;
  };

  return (
    <LinearGradient
      colors={AppThemeGradient}
      style={[
        styles.gradientHeader,
        { paddingTop: getTopPadding() }
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft stroke="#303030ff" width={24} height={24} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        {isProfile && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={openProfile}
          >
            <Edit2 stroke="#222222" width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(36, 36, 36, 0.9)',
    textAlign: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for logout button
  }
});

export default LinearHeader