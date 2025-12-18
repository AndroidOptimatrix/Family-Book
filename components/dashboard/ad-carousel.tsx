// AdCarousel.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Advertisement } from '../../types/dashboard.types';
import { ChevronLeft, ChevronRight } from 'react-native-feather';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 250;

interface AdCarouselProps {
  advertisements: Advertisement[];
}

const AdCarousel: React.FC<AdCarouselProps> = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % advertisements.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }, 4000); // Auto-slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [currentIndex, advertisements.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index !== undefined) {
      setCurrentIndex(viewableItems[0].index as number);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: Advertisement }) => (
    <View style={styles.adCard}>
      <Image 
        source={{ 
          uri: item.image || 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=250&fit=crop'
        }} 
        style={styles.adImage} 
        resizeMode="contain"
      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.adOverlay}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.adContent}>
          {item.description && (
            <Text style={styles.adDescription} numberOfLines={3}>
              {item.description}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const navigateToSlide = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? advertisements.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === advertisements.length - 1 ? 0 : currentIndex + 1;
    }
    
    flatListRef.current?.scrollToIndex({
      index: newIndex,
      animated: true,
    });
    setCurrentIndex(newIndex);
  };

  if (advertisements.length === 0) {
    return (
      <View style={[styles.adCard, styles.emptyCard]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=250&fit=crop' }} 
          style={styles.adImage} 
          resizeMode="contain"
        />
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>No Advertisements Available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Carousel Container */}
      <View style={styles.carouselContainer}>
        {/* Previous Button */}
        {advertisements.length > 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={() => navigateToSlide('prev')}
            activeOpacity={0.8}
          >
            <ChevronLeft stroke="#FFFFFF" width={24} height={24} />
          </TouchableOpacity>
        )}

        {/* FlatList for Carousel */}
        <Animated.FlatList
          ref={flatListRef}
          data={advertisements}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.image || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.flatListContent}
          initialScrollIndex={0}
        />

        {/* Next Button */}
        {advertisements.length > 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={() => navigateToSlide('next')}
            activeOpacity={0.8}
          >
            <ChevronRight stroke="#FFFFFF" width={24} height={24} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  carouselContainer: {
    position: 'relative',
    height: CARD_HEIGHT,
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  adCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  adImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  adContent: {
    maxWidth: '80%',
  },
  adTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  adDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  adBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  indicator: {
    width: 30,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  indicatorDotActive: {
    backgroundColor: '#6366F1',
    width: 24,
  },
  counterContainer: {
    position: 'absolute',
    bottom: -30,
    right: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
});

export default AdCarousel;