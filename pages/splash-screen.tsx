import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
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
  appName?: string;
  tagline?: string;
  version?: string;
  showProgressBar?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  logoSource = require('../vertical-logo.png'),
  appName = 'Family Book',
  tagline = 'Where Memories Live Forever',
  version = 'Version 1.0.0',
  showProgressBar = true,
}) => {

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.5)).current; // Start zoomed in
  const textAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const zoomOutAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
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
        
        // Zoom out animation sequence
        Animated.parallel([
          // Main zoom out animation
          Animated.timing(scaleAnim, {
            toValue: 1.0, // Zoom out to normal size
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          
          // Additional zoom out effect for smoothness
          Animated.timing(zoomOutAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        
        // Show text after zoom out
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      
      // Progress bar animation
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
  }, [fadeAnim, scaleAnim, textAnim, progressAnim, zoomOutAnim, onAnimationComplete]);

  // Glow effect opacity that fades in and out during zoom
  const glowOpacity = zoomOutAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.15],
  });

  // Subtle glow scale effect during zoom out
  const glowScale = zoomOutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.2, 1.0],
  });

  // Additional bounce effect at the end of zoom
  const bounceEffect = zoomOutAnim.interpolate({
    inputRange: [0, 0.8, 0.9, 1],
    outputRange: [0, 0, 0.05, 0],
  });

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

      {/* Animated rings */}
      <Animated.View style={[styles.ring, styles.ring1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.ring, styles.ring2, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.ring, styles.ring3, { opacity: fadeAnim }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo container */}
        <View style={styles.logoWrapper}>
          {/* Glow effect with zoom animation */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                transform: [{ scale: glowScale }],
                opacity: glowOpacity,
              }
            ]}
          />

          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { scale: Animated.add(1, bounceEffect) }, // Add subtle bounce
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
            />
          </Animated.View>
        </View>

        {/* App Name and Tagline */}
        <Animated.View style={[styles.textContainer, { opacity: textAnim }]}>
          <Text style={styles.appName}>
            {appName}
          </Text>

          <Text style={styles.tagline}>
            {tagline}
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        {showProgressBar && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { width: progressWidth }
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: textAnim }]}>
          <Text style={styles.version}>{version}</Text>
          <Text style={styles.company}>
            © {new Date().getFullYear()} {appName} Inc.
          </Text>
        </Animated.View>
      </Animated.View>
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
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 2,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  glowEffect: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  ring1: {
    width: width * 2,
    height: width * 2,
    top: -width * 0.5,
    left: -width * 0.5,
  },
  ring2: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.25,
    left: -width * 0.25,
  },
  ring3: {
    width: width,
    height: width,
    top: 0,
    left: 0,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(32, 32, 32, 0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 30,
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#414141ff',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(29, 29, 29, 0.8)',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  version: {
    fontSize: 12,
    color: 'rgba(80, 80, 80, 0.6)',
    marginBottom: 4,
    textAlign: 'center',
  },
  company: {
    fontSize: 12,
    color: 'rgba(63, 63, 63, 0.5)',
    textAlign: 'center',
  }
});

export default SplashScreen;