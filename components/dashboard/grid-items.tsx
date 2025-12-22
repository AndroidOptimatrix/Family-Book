import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GridItem as GridItemType } from '../../types/dashboard.types';

interface GridItemProps {
  item: GridItemType;
  onPress?: () => void;
}

const GridItem: React.FC<GridItemProps> = ({ item, onPress }) => {
  const Icon = item.icon;

  return (
    <TouchableOpacity onPress={onPress}>
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
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    margin: 4,
    elevation: 0, // ← Set to 0
    shadowOpacity: 0, // ← Set to 0
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    textAlign: 'center',
  },
});

export default GridItem;