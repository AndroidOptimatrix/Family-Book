// GridItem.tsx - Updated for full width horizontal cards
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GridItem as GridItemType } from '../../types/dashboard.types';

interface GridItemProps {
  item: GridItemType;
  onPress?: () => void;
  flex?: boolean;
}

const DevicePlatform = Platform;

const GridItem: React.FC<GridItemProps> = ({ item, onPress, flex = false }) => {
  const Icon = item.icon;
  
  return (
    <TouchableOpacity 
      style={styles.touchableContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.container, { backgroundColor: item.gradient }]}>
        <View style={styles.content}>
          {/* Icon with Gradient Background */}
          <LinearGradient
            style={styles.iconContainer}
            colors={item.icon_bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon stroke="#fff" width={24} height={24} />
          </LinearGradient>
          
          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.englishTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.gujaratiTitle} numberOfLines={1}>
              {item.gujTitle}
            </Text>
          </View>
          
          {/* Arrow Indicator */}
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 30; // 15 padding on each side

const styles = StyleSheet.create({
  touchableContainer: {
    width: width - SCREEN_PADDING,
    alignSelf: 'center',
  },
  container: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  englishTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  gujaratiTitle: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: DevicePlatform.OS === 'android' ? 'sans-serif' : 'System', // You might want to use a Gujarati font
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
  },
  arrow: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
  },
});

export default GridItem;