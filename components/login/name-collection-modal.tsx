import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Phone, User, X, ChevronRight } from 'react-native-feather';

interface NameCollectionModalProps {
  visible: boolean;
  userName: string;
  phoneNumber: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const NameCollectionModal: React.FC<NameCollectionModalProps> = ({
  visible,
  userName,
  phoneNumber,
  onNameChange,
  onSubmit,
  onClose,
}) => {
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(modalAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{
                scale: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }]
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Welcome to Family Book! 👋</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X stroke="#6B7280" width={20} height={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <User stroke="#3B82F6" width={40} height={40} />
            </View>

            <Text style={styles.modalSubtitle}>
              Let's personalize your experience
            </Text>

            <Text style={styles.modalDescription}>
              Please enter your name to complete your profile
            </Text>

            <View style={styles.phoneDisplayContainer}>
              <Text style={styles.phoneLabel}>Phone Number</Text>
              <View style={styles.phoneDisplay}>
                <Phone stroke="#3B82F6" width={18} height={18} />
                <Text style={styles.phoneText}>{phoneNumber}</Text>
              </View>
            </View>

            <View style={styles.nameInputContainer}>
              <Text style={styles.nameLabel}>Your Name *</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={userName}
                onChangeText={onNameChange}
                autoCapitalize="words"
                maxLength={50}
                selectionColor="#3B82F6"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.submitButton, !userName.trim() && styles.submitButtonDisabled]}
                onPress={onSubmit}
                disabled={!userName.trim()}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF']}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitButtonText}>Complete Profile</Text>
                  <ChevronRight stroke="#FFFFFF" width={18} height={18} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.modalFooterText}>
              You can update your name later in profile settings
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  phoneDisplayContainer: {
    marginBottom: 20,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  phoneText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  nameInputContainer: {
    marginBottom: 24,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  modalButtons: {
    gap: 12,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default NameCollectionModal;