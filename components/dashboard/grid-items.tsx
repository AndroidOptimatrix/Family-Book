// GridItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      style={[styles.container, { backgroundColor: item.gradient }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <LinearGradient
          style={styles.iconContainer}
          colors={item.icon_bg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon stroke="#fff" width={22} height={22} />
        </LinearGradient>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    margin: 4,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  content: {
    padding: 12,
    alignItems: 'center',
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#4B5563',
  },
});

export default GridItem;