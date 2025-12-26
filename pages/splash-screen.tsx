import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppThemeGradient } from '../config/config';

const { width, height } = Dimensions.get('window');

// Define props interface
interface SplashScreenProps {
  onAnimationComplete?: () => void;
  logoSource?: ImageSourcePropType;
  showProgressBar?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  logoSource = require('../vertical-logo.png'),
  showProgressBar = true,
}) => {

  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Start smaller for zoom-in
  const progressAnim = useRef(new Animated.Value(0)).current;
  const zoomInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only start animations after image is loaded
    if (!imageLoaded) return;

    const animationDuration = 2000;

    // Start all animations
    Animated.parallel([
      Animated.sequence([
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        
        // ZOOM-IN animation sequence
        Animated.parallel([
          // Main zoom-in animation
          Animated.timing(scaleAnim, {
            toValue: 1.0, // Zoom in to normal size
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          
          // Additional zoom-in effect for smoothness
          Animated.timing(zoomInAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      
      // Progress bar animation - starts only after image loads
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ]).start();

    // Completion timeout
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, progressAnim, zoomInAnim, onAnimationComplete, imageLoaded]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Scale effect for zoom-in
  const imageScale = zoomInAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.0, 1.02], // Subtle overshoot then settle
  });

  // Combined scale
  const combinedScale = Animated.multiply(scaleAnim, imageScale);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={AppThemeGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Main content with proper layout */}
      <View style={styles.mainContent}>
        {/* Logo container with proper positioning */}
        <View style={styles.logoWrapper}>
          <Animated.View 
            style={[
              styles.logoContainer,
              { 
                opacity: fadeAnim,
                transform: [
                  { scale: combinedScale },
                ],
              }
            ]}
          >
            {/* Logo Image */}
            <Image
              source={logoSource}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="App Logo"
              onLoad={handleImageLoad}
            />
          </Animated.View>

          {/* Progress Bar - positioned right below logo */}
          {showProgressBar && imageLoaded && (
            <View style={styles.progressWrapper}>
              <View style={styles.progressBackground}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: progressWidth }
                  ]}
                />
              </View>
            </View>
          )}

          {/* Loading indicator while image loads */}
          {!imageLoaded && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    width: width * 0.4,
    height: height * 0.25,
    maxWidth: 200,
    maxHeight: 150,
  },
  // Progress bar positioned right below the logo
  progressWrapper: {
    width: '60%',
    marginTop: 30, // Space between logo and progress bar
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#2C3E50',
  },
  loadingContainer: {
    marginTop: 30, // Same spacing as progress bar
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.6,
    transform: [{ scale: 0.8 }],
  },
  dot2: {
    opacity: 0.8,
    transform: [{ scale: 1.0 }],
  },
  dot3: {
    opacity: 0.6,
    transform: [{ scale: 0.8 }],
  },
});

export default SplashScreen;