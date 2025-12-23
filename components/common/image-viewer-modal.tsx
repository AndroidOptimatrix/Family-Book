import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    ScrollView,
    Image,
    Modal,
} from 'react-native';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'react-native-feather';

const { width, height } = Dimensions.get('window');

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
    const verticalScrollRef = useRef<ScrollView>(null);
    const horizontalScrollRef = useRef<ScrollView>(null);
    const lastTap = useRef<number>(0);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [containerAspectRatio, setContainerAspectRatio] = useState(1);

    // Get image dimensions when loaded
    const handleImageLoad = (event: any) => {
        const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
        setImageDimensions({ width: imgWidth, height: imgHeight });
        setContainerAspectRatio(imgWidth / imgHeight);
    };

    const resetImageTransforms = () => {
        setZoomScale(1);
        if (verticalScrollRef.current) {
            verticalScrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
        if (horizontalScrollRef.current) {
            horizontalScrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
    };

    const handleZoomIn = () => {
        const newScale = Math.min(5, zoomScale * 1.3);
        setZoomScale(newScale);
        
        // Center the image after zooming
        setTimeout(() => {
            centerImageAfterZoom(newScale);
        }, 50);
    };

    const handleZoomOut = () => {
        const newScale = Math.max(1, zoomScale * 0.7);
        setZoomScale(newScale);
        
        if (newScale === 1) {
            resetImageTransforms();
        } else {
            setTimeout(() => {
                centerImageAfterZoom(newScale);
            }, 50);
        }
    };

    const centerImageAfterZoom = (scale: number) => {
        // Calculate container dimensions based on aspect ratio
        let containerWidth, containerHeight;
        
        if (containerAspectRatio > 1) {
            // Landscape image
            containerWidth = Math.min(width, height * 0.8 * containerAspectRatio);
            containerHeight = containerWidth / containerAspectRatio;
        } else {
            // Portrait image
            containerHeight = Math.min(height * 0.8, width / containerAspectRatio);
            containerWidth = containerHeight * containerAspectRatio;
        }
        
        const scaledWidth = containerWidth * scale;
        const scaledHeight = containerHeight * scale;
        
        // Calculate scroll positions to center the image
        if (scaledWidth > width) {
            const scrollX = (scaledWidth - width) / 2;
            if (horizontalScrollRef.current) {
                horizontalScrollRef.current.scrollTo({ x: scrollX, y: 0, animated: true });
            }
        }
        
        if (scaledHeight > height * 0.8) {
            const scrollY = (scaledHeight - height * 0.8) / 2;
            if (verticalScrollRef.current) {
                verticalScrollRef.current.scrollTo({ x: 0, y: scrollY, animated: true });
            }
        }
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        
        if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
            if (zoomScale === 1) {
                setZoomScale(2);
                setTimeout(() => {
                    centerImageAfterZoom(2);
                }, 50);
            } else {
                resetImageTransforms();
            }
        }
        
        lastTap.current = now;
    };

    const handleClose = () => {
        onClose();
        resetImageTransforms();
    };

    // Calculate image container dimensions based on aspect ratio
    const calculateContainerDimensions = () => {
        if (containerAspectRatio === 0 || !imageDimensions.width) {
            return { width: width, height: height * 0.8 };
        }
        
        let containerWidth, containerHeight;
        
        if (containerAspectRatio > 1) {
            // Landscape image - width limited by screen width
            containerWidth = Math.min(width, height * 0.8 * containerAspectRatio);
            containerHeight = containerWidth / containerAspectRatio;
        } else {
            // Portrait image - height limited by screen height
            containerHeight = Math.min(height * 0.8, width / containerAspectRatio);
            containerWidth = containerHeight * containerAspectRatio;
        }
        
        return {
            width: containerWidth * zoomScale,
            height: containerHeight * zoomScale
        };
    };

    const containerDims = calculateContainerDimensions();

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                >
                    <X stroke="#FFFFFF" width={28} height={28} />
                </TouchableOpacity>


                {/* Main Vertical ScrollView */}
                <ScrollView
                    ref={verticalScrollRef}
                    style={styles.verticalScrollContainer}
                    contentContainerStyle={[
                        styles.verticalScrollContent,
                        { 
                            minHeight: Math.max(height * 0.8, containerDims.height),
                            justifyContent: 'center',
                        }
                    ]}
                    showsVerticalScrollIndicator={false}
                    bounces={zoomScale > 1}
                    maximumZoomScale={1}
                    minimumZoomScale={1}
                    scrollEnabled={zoomScale > 1}
                >
                    {/* Horizontal ScrollView */}
                    <ScrollView
                        ref={horizontalScrollRef}
                        horizontal={true}
                        style={[
                            styles.horizontalScrollContainer,
                            { height: Math.min(height * 0.8, containerDims.height) }
                        ]}
                        contentContainerStyle={[
                            styles.horizontalScrollContent,
                            { 
                                minWidth: Math.max(width, containerDims.width),
                                justifyContent: 'center',
                            }
                        ]}
                        showsHorizontalScrollIndicator={false}
                        bounces={zoomScale > 1}
                        maximumZoomScale={1}
                        minimumZoomScale={1}
                        scrollEnabled={zoomScale > 1}
                    >
                        <TouchableOpacity 
                            activeOpacity={1}
                            onPress={handleDoubleTap}
                            style={[
                                styles.imageContainer,
                                { 
                                    width: containerDims.width, 
                                    height: containerDims.height,
                                }
                            ]}
                        >
                            <Image
                                source={{ uri: imageUri || '' }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                                onLoad={handleImageLoad}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.95)',
    },
    verticalScrollContainer: {
        flex: 1,
    },
    verticalScrollContent: {
        alignItems: 'center',
    },
    horizontalScrollContainer: {
        alignSelf: 'center',
    },
    horizontalScrollContent: {
        alignItems: 'center',
        height: '100%',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    zoomControls: {
        position: 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'column',
        gap: 12,
        zIndex: 1000,
    },
    zoomButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    instructionsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    instructionsText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 5,
    },
    zoomIndicator: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
});

export default ImageViewerModal;