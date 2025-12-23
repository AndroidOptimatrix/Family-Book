// GridItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GridItem as GridItemType } from '../../types/dashboard.types';

interface GridItemProps {
  item: GridItemType;
  onPress?: () => void;
}

const GridItem: React.FC<GridItemProps> = ({ item, onPress }) => {
  const Icon = item.icon;
  
  return (
    <TouchableOpacity 
      style={styles.touchableContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.container, { backgroundColor: item.gradient }]}>
        <View style={styles.content}>
          <LinearGradient
            style={styles.iconContainer}
            colors={item.icon_bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon stroke="#fff" width={22} height={22} />
          </LinearGradient>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 30; 
const GAP = 12; 
const NUM_COLUMNS = 3;
const CARD_WIDTH = (width - SCREEN_PADDING - (GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

const styles = StyleSheet.create({
  touchableContainer: {
    width: CARD_WIDTH,
  },
  container: {
    width: '100%',
    height:100, // Make it square (or adjust ratio)
    borderRadius: 12,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default GridItem;