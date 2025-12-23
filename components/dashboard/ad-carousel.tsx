import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ViewToken,
} from 'react-native';
import { Advertisement } from '../../types/dashboard.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 250;

interface AdCarouselProps {
  advertisements: Advertisement[];
}

const AdCarousel: React.FC<AdCarouselProps> = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: CARD_WIDTH,
      offset: CARD_WIDTH * index,
      index,
    }),
    []
  );

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % advertisements.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * CARD_WIDTH,
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

  const handleLayout = useCallback(() => {
    if (advertisements.length > 0 && flatListRef.current && !isLayoutReady) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });
        setIsLayoutReady(true);
      });
    }
  }, [advertisements.length, isLayoutReady]);

  useEffect(() => {
    setIsLayoutReady(false);
    if (advertisements.length > 0) {
      handleLayout();
    }
  }, [advertisements]);

  const renderItem = ({ item }: { item: Advertisement }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{
          uri: item.image || 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=250&fit=crop'
        }}
        style={styles.adImage}
        resizeMode="contain"
      />
    </View>
  );

  if (advertisements.length === 0) {
    return (
      <View style={styles.staticContainer}>
        <View style={styles.borderedContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=250&fit=crop' }}
            style={styles.adImage}
            resizeMode="contain"
          />
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyText}>No Advertisements Available</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.staticContainer}>
      {/* Fixed bordered container */}
      <View style={styles.borderedContainer}>
        {/* Swipeable images inside */}
        <Animated.FlatList
          ref={flatListRef}
          data={advertisements}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.image || index.toString()}-${advertisements.length}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          initialNumToRender={advertisements.length}
          maxToRenderPerBatch={advertisements.length}
          windowSize={5}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  staticContainer: {
    position: 'relative',
  },
  borderedContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden', // This keeps the swipe inside the border
    borderWidth: 1,
    borderColor: 'rgba(19, 19, 19, 0.08)',
    elevation: 0,
    shadowOpacity: 0,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  adImage: {
    width: '100%',
    height: '100%',
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
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
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
});

export default AdCarousel;