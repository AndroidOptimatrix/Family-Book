// components/common/ImageViewerModal.tsx
import React, { useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet,
    ViewStyle,
    ImageStyle,
} from 'react-native';
import Modal from 'react-native-modal';
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
    // Animation values
    const scale = useRef(new Animated.Value(1)).current;
    const currentScale = useRef(1);

    // Reset all transforms
    const resetImageTransforms = () => {
        currentScale.current = 1;
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Handle zoom in
    const handleZoomIn = () => {
        currentScale.current = currentScale.current * 1.3;
        Animated.spring(scale, {
            toValue: currentScale.current,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    // Handle zoom out
    const handleZoomOut = () => {
        currentScale.current = Math.max(1, currentScale.current * 0.7);
        Animated.spring(scale, {
            toValue: currentScale.current,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    // Handle double tap zoom
    const handleDoubleTap = () => {
        if (currentScale.current === 1) {
            currentScale.current = 2;
            Animated.spring(scale, {
                toValue: 2,
                friction: 3,
                useNativeDriver: true,
            }).start();
        } else {
            resetImageTransforms();
        }
    };

    // Handle modal close
    const handleClose = () => {
        onClose();
        resetImageTransforms();
    };

    return (
        <Modal
            isVisible={isVisible}
            style={styles.modal}
            backdropOpacity={0.95}
            animationIn="fadeIn"
            animationOut="fadeOut"
            onBackdropPress={handleClose}
            onBackButtonPress={handleClose}
            statusBarTranslucent={true}
            deviceHeight={height + 100}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
        >
            <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.8}
                >
                    <X stroke="#FFFFFF" width={28} height={28} />
                </TouchableOpacity>

                {/* Zoom Controls */}
                <View style={styles.zoomControls}>
                    <TouchableOpacity
                        style={styles.zoomButton}
                        onPress={handleZoomIn}
                        activeOpacity={0.7}
                    >
                        <ZoomIn stroke="#FFFFFF" width={24} height={24} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.zoomButton}
                        onPress={handleZoomOut}
                        activeOpacity={0.7}
                    >
                        <ZoomOut stroke="#FFFFFF" width={24} height={24} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.zoomButton}
                        onPress={resetImageTransforms}
                        activeOpacity={0.7}
                    >
                        <Maximize2 stroke="#FFFFFF" width={24} height={24} />
                    </TouchableOpacity>
                </View>

                {/* Image Container */}
                <TouchableOpacity 
                    style={styles.imageContainer}
                    activeOpacity={1}
                    onPress={handleDoubleTap}
                >
                    <Animated.Image
                        source={{ uri: imageUri || '' }}
                        style={[
                            styles.fullScreenImage,
                            {
                                transform: [{ scale: scale }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>
                        Double tap to zoom • Use buttons to zoom in/out
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        padding: 0,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
    },
    closeButton: {
        position: 'absolute' as 'absolute',
        top: 50,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
        zIndex: 1000,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    zoomControls: {
        position: 'absolute' as 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'column' as 'column',
        gap: 12,
        zIndex: 1000,
    },
    zoomButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
        padding: 20,
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
        maxWidth: '100%',
        maxHeight: '80%',
    },
    instructionsContainer: {
        position: 'absolute' as 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center' as 'center',
        paddingHorizontal: 20,
    },
    instructionsText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        textAlign: 'center' as 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
});

export default ImageViewerModal;