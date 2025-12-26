import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Image,
    Modal,
    Animated,
} from 'react-native';
import { ArrowLeft } from 'react-native-feather';
import {
    GestureHandlerRootView,
    PinchGestureHandler,
    TapGestureHandler,
    PanGestureHandler,
    State,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerModalProps {
    isVisible: boolean;
    imageUri: string | null;
    onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
    isVisible,
    imageUri,
    onClose,
}) => {
    const [zoomScale, setZoomScale] = useState(1);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [imageAspectRatio, setImageAspectRatio] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showBackButton, setShowBackButton] = useState(true);
    
    // For panning
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const lastOffset = useRef({ x: 0, y: 0 });
    const isPanning = useRef(false);
    
    // For pinch gesture
    const lastScale = useRef(1);
    const scale = useRef(1);
    
    // Refs for gesture handlers
    const doubleTapRef = useRef<TapGestureHandler>(null);
    const pinchRef = useRef<PinchGestureHandler>(null);
    const panRef = useRef<PanGestureHandler>(null);
    
    // Animation values
    const backButtonOpacity = useRef(new Animated.Value(1)).current;
    const zoomIndicatorOpacity = useRef(new Animated.Value(1)).current;
    
    // Calculate image display dimensions
    const calculateDisplayDimensions = useCallback((scaleValue: number = zoomScale) => {
        if (!imageDimensions.width || !imageDimensions.height) {
            return { width: 0, height: 0 };
        }
        
        const containerWidth = SCREEN_WIDTH;
        const containerHeight = SCREEN_HEIGHT;
        
        let displayWidth, displayHeight;
        
        // Calculate natural fitted dimensions
        if (imageAspectRatio > containerWidth / containerHeight) {
            // Landscape image - width limited
            displayWidth = containerWidth;
            displayHeight = containerWidth / imageAspectRatio;
        } else {
            // Portrait or square image - height limited
            displayHeight = containerHeight;
            displayWidth = containerHeight * imageAspectRatio;
        }
        
        // Apply zoom scale
        return {
            width: displayWidth * scaleValue,
            height: displayHeight * scaleValue
        };
    }, [imageDimensions, imageAspectRatio, zoomScale]);
    
    // Calculate pan boundaries based on current zoom
    const calculatePanBoundaries = useCallback((scaleValue: number = zoomScale) => {
        const displayDims = calculateDisplayDimensions(scaleValue);
        
        const panBoundaryX = Math.max(0, (displayDims.width - SCREEN_WIDTH) / 2);
        const panBoundaryY = Math.max(0, (displayDims.height - SCREEN_HEIGHT) / 2);
        
        return {
            minX: -panBoundaryX,
            maxX: panBoundaryX,
            minY: -panBoundaryY,
            maxY: panBoundaryY,
        };
    }, [calculateDisplayDimensions, zoomScale]);
    
    // Get image dimensions when loaded
    const handleImageLoad = useCallback((event: any) => {
        const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
        setImageDimensions({ width: imgWidth, height: imgHeight });
        setImageAspectRatio(imgWidth / imgHeight);
        setIsLoading(false);
    }, []);
    
    // Hide controls
    const hideControls = useCallback(() => {
        Animated.parallel([
            Animated.timing(backButtonOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(zoomIndicatorOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start(() => {
            setShowBackButton(false);
        });
    }, [backButtonOpacity, zoomIndicatorOpacity]);
    
    // Show controls
    const showControls = useCallback(() => {
        setShowBackButton(true);
        Animated.parallel([
            Animated.timing(backButtonOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(zoomIndicatorOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    }, [backButtonOpacity, zoomIndicatorOpacity]);
    
    // Reset everything
    const resetImageTransforms = useCallback(() => {
        setZoomScale(1);
        scale.current = 1;
        lastScale.current = 1;
        setOffset({ x: 0, y: 0 });
        lastOffset.current = { x: 0, y: 0 };
        setIsZoomed(false);
        showControls();
    }, [showControls]);
    
    // Handle double tap
    const handleDoubleTap = useCallback((event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            if (zoomScale === 1) {
                // Zoom in to 2x
                const newScale = 2;
                setZoomScale(newScale);
                scale.current = newScale;
                lastScale.current = newScale;
                setIsZoomed(true);
                hideControls();
                
                // Center on double tap location
                const { x, y } = event.nativeEvent;
                const centerX = (SCREEN_WIDTH / 2 - x) * (newScale - 1);
                const centerY = (SCREEN_HEIGHT / 2 - y) * (newScale - 1);
                
                const boundaries = calculatePanBoundaries(newScale);
                const clampedX = Math.max(boundaries.minX, Math.min(boundaries.maxX, centerX));
                const clampedY = Math.max(boundaries.minY, Math.min(boundaries.maxY, centerY));
                
                setOffset({ x: clampedX, y: clampedY });
                lastOffset.current = { x: clampedX, y: clampedY };
            } else {
                // Reset zoom
                resetImageTransforms();
            }
        }
    }, [zoomScale, hideControls, resetImageTransforms, calculatePanBoundaries]);
    
    // Handle single tap
    const handleSingleTap = useCallback((event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            if (showBackButton) {
                hideControls();
            } else {
                showControls();
            }
        }
    }, [showBackButton, hideControls, showControls]);
    
    // Handle pinch gesture
    const onPinchGestureEvent = useCallback((event: any) => {
        if (event.nativeEvent.state === State.BEGAN) {
            hideControls();
            lastScale.current = scale.current;
        }
        
        if (event.nativeEvent.state === State.ACTIVE) {
            const newScale = Math.max(1, Math.min(5, lastScale.current * event.nativeEvent.scale));
            scale.current = newScale;
            setZoomScale(newScale);
            
            if (newScale > 1) {
                setIsZoomed(true);
            }
        }
        
        if (event.nativeEvent.state === State.END) {
            // Snap to 1 if zoomed out too far
            if (scale.current < 1.1) {
                resetImageTransforms();
            } else {
                lastScale.current = scale.current;
                // Adjust offset to stay within boundaries
                const boundaries = calculatePanBoundaries(scale.current);
                const clampedX = Math.max(boundaries.minX, Math.min(boundaries.maxX, offset.x));
                const clampedY = Math.max(boundaries.minY, Math.min(boundaries.maxY, offset.y));
                
                if (clampedX !== offset.x || clampedY !== offset.y) {
                    setOffset({ x: clampedX, y: clampedY });
                    lastOffset.current = { x: clampedX, y: clampedY };
                }
            }
        }
    }, [hideControls, resetImageTransforms, calculatePanBoundaries, offset]);
    
    // Handle pan gesture when zoomed
    const onPanGestureEvent = useCallback((event: any) => {
        if (!isZoomed) return;
        
        const { translationX, translationY, state } = event.nativeEvent;
        
        if (state === State.BEGAN) {
            hideControls();
            isPanning.current = true;
            // Reset translation reference
            lastOffset.current = offset;
        }
        
        if (state === State.ACTIVE) {
            // Calculate new offset based on translation
            const newX = lastOffset.current.x + translationX;
            const newY = lastOffset.current.y + translationY;
            
            // Apply boundaries
            const boundaries = calculatePanBoundaries();
            const clampedX = Math.max(boundaries.minX, Math.min(boundaries.maxX, newX));
            const clampedY = Math.max(boundaries.minY, Math.min(boundaries.maxY, newY));
            
            setOffset({ x: clampedX, y: clampedY });
        }
        
        if (state === State.END || state === State.CANCELLED) {
            isPanning.current = false;
            // Update last offset to current position
            lastOffset.current = offset;
        }
    }, [isZoomed, hideControls, offset, calculatePanBoundaries]);
    
    const handleClose = useCallback(() => {
        resetImageTransforms();
        setIsLoading(true);
        onClose();
    }, [resetImageTransforms, onClose]);
    
    const displayDims = calculateDisplayDimensions();
    
    // Reset when modal closes
    useEffect(() => {
        if (!isVisible) {
            resetImageTransforms();
            setIsLoading(true);
        }
    }, [isVisible, resetImageTransforms]);
    
    // Auto-hide controls after 3 seconds when zoomed
    useEffect(() => {
        if (isZoomed && showBackButton && !isPanning.current) {
            const timer = setTimeout(() => {
                hideControls();
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [isZoomed, showBackButton, hideControls]);
    
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            <GestureHandlerRootView style={styles.modalContent}>
                {/* Arrow Back Button with fade animation */}
                {showBackButton && (
                    <Animated.View style={[styles.backButtonContainer, { opacity: backButtonOpacity }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft stroke="#FFFFFF" width={28} height={28} />
                        </TouchableOpacity>
                    </Animated.View>
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingSpinner}>
                            <View style={styles.spinnerDot} />
                        </View>
                    </View>
                )}
                
                {/* Double Tap Handler */}
                <TapGestureHandler
                    ref={doubleTapRef}
                    numberOfTaps={2}
                    onHandlerStateChange={handleDoubleTap}
                >
                    <View style={styles.gestureContainer}>
                        {/* Single Tap Handler */}
                        <TapGestureHandler
                            numberOfTaps={1}
                            waitFor={doubleTapRef}
                            onHandlerStateChange={handleSingleTap}
                        >
                            <View style={styles.gestureContainer}>
                                {/* Pan Handler for moving when zoomed */}
                                <PanGestureHandler
                                    ref={panRef}
                                    onGestureEvent={onPanGestureEvent}
                                    onHandlerStateChange={onPanGestureEvent}
                                    minDist={10}
                                    enabled={isZoomed}
                                >
                                    <View style={styles.gestureContainer}>
                                        {/* Pinch Handler for zooming */}
                                        <PinchGestureHandler
                                            ref={pinchRef}
                                            onGestureEvent={onPinchGestureEvent}
                                            onHandlerStateChange={onPinchGestureEvent}
                                            simultaneousHandlers={panRef}
                                        >
                                            <View style={styles.gestureContainer}>
                                                {/* Image Container */}
                                                <View style={[
                                                    styles.imageContainer,
                                                    {
                                                        width: displayDims.width,
                                                        height: displayDims.height,
                                                        transform: [
                                                            { translateX: offset.x },
                                                            { translateY: offset.y }
                                                        ]
                                                    }
                                                ]}>
                                                    <Image
                                                        source={{ uri: imageUri || '' }}
                                                        style={[styles.fullScreenImage, {
                                                            width: displayDims.width,
                                                            height: displayDims.height
                                                        }]}
                                                        resizeMode="contain"
                                                        onLoadStart={() => setIsLoading(true)}
                                                        onLoad={handleImageLoad}
                                                        onError={() => setIsLoading(false)}
                                                    />
                                                </View>
                                            </View>
                                        </PinchGestureHandler>
                                    </View>
                                </PanGestureHandler>
                            </View>
                        </TapGestureHandler>
                    </View>
                </TapGestureHandler>
                
                {/* Zoom Indicator with fade animation */}
                {isZoomed && (
                    <Animated.View style={[styles.zoomIndicator, { opacity: zoomIndicatorOpacity }]}>
                        <Text style={styles.zoomIndicatorText}>
                            {Math.round(zoomScale * 100)}%
                        </Text>
                    </Animated.View>
                )}
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gestureContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1000,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        resizeMode: 'contain',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 999,
    },
    loadingSpinner: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        opacity: 0.7,
    },
    zoomIndicator: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    zoomIndicatorText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ImageViewerModal;