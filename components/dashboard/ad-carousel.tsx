// AdCarousel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight } from 'react-native-feather';
import { Advertisement } from '../../types/dashboard.types';

const { width } = Dimensions.get('window');

interface AdCarouselProps {
  advertisements: Advertisement[];
}

const AdCarousel: React.FC<AdCarouselProps> = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderItem = ({ item, index }: { item: Advertisement; index: number }) => (
    <View style={styles.adCard}>
      <Image source={{ uri: item.image }} style={styles.adImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.adOverlay}
      >
        <View style={styles.adContent}>
          <Text style={styles.adTitle}>{item.title}</Text>
          <Text style={styles.adDescription}>{item.description}</Text>
          <TouchableOpacity style={styles.adButton}>
            <Text style={styles.adButtonText}>View Details</Text>
            <ChevronRight stroke="#FFFFFF" width={16} height={16} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <>
      <FlatList
        data={advertisements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.adContainer}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / (width - 40)
          );
          setCurrentIndex(index);
        }}
      />
      <View style={styles.adIndicatorContainer}>
        {advertisements.map((_, i) => (
          <View
            key={i}
            style={[
              styles.adIndicator,
              i === currentIndex && styles.adIndicatorActive,
            ]}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  adCard: {
    width: width - 40,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  adContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  adTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  adButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  adIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  adIndicatorActive: {
    backgroundColor: '#6366F1',
    width: 20,
  },
});

export default AdCarousel;