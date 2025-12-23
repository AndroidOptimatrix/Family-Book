import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { X, Clock } from 'react-native-feather';

const { width, height } = Dimensions.get('window');

interface ComingSoonModalProps {
    visible: boolean;
    onClose: () => void;
    featureName?: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
    visible,
    onClose,
    featureName = 'This feature'
}) => {
    // Close modal when tapping the backdrop
    const handleBackdropPress = () => {
        onClose();
    };

    // Prevent closing when tapping the modal content itself
    const handleModalContentPress = (e: any) => {
        e.stopPropagation();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback onPress={handleModalContentPress}>
                        <View style={styles.modalContainer}>
                            {/* Close button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <X stroke="#6B7280" width={20} height={20} />
                            </TouchableOpacity>

                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                <Clock stroke="#6366F1" width={60} height={60} />
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>Coming Soon!</Text>

                            {/* Message */}
                            <Text style={styles.message}>
                                {featureName} is currently under development.
                                We're working hard to bring it to you!
                            </Text>

                            {/* Action Button */}
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.actionButtonText}>Got it!</Text>
                            </TouchableOpacity>

                            {/* Subtext */}
                            <Text style={styles.subtext}>
                                Check back later for updates
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: width * 0.85,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    actionButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 16,
        width: '100%',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

export default ComingSoonModal;