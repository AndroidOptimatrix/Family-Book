import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ChevronRight,
} from 'react-native-feather';
import LinearHeader from '../components/common/header';

const SupportScreen: React.FC = () => {
  const supportEmail = 'support@familybook.com';
  const supportPhone = '+91 1800 123 4567';
  const whatsappNumber = '+919876543210';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}?subject=Family Book Support`).catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${supportPhone.replace(/\s/g, '')}`).catch(() => {
      Alert.alert('Error', 'Unable to make a phone call');
    });
  };

  const handleWhatsAppPress = () => {
    const message = 'Hello, I need help with Family Book app.';
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'WhatsApp Not Installed',
        'Please install WhatsApp to contact us via WhatsApp.',
        [{ text: 'OK' }]
      );
    });
  };

  const contactInfoItems = [
    {
      id: 1,
      icon: <Mail width={20} height={20} color="#4F46E5" />,
      label: 'Email Address',
      value: supportEmail,
      action: handleEmailPress,
      actionIcon: <ChevronRight width={20} height={20} color="#4F46E5" />,
    },
    {
      id: 2,
      icon: <Phone width={20} height={20} color="#10B981" />,
      label: 'Phone Number',
      value: supportPhone,
      action: handlePhonePress,
      actionIcon: <ChevronRight width={20} height={20} color="#10B981" />,
    },
    {
      id: 3,
      icon: <MessageCircle width={20} height={20} color="#25D366" />,
      label: 'WhatsApp',
      value: 'Message us on WhatsApp',
      action: handleWhatsAppPress,
      actionIcon: <ChevronRight width={20} height={20} color="#25D366" />,
    },
    {
      id: 4,
      icon: <Clock width={20} height={20} color="#6B7280" />,
      label: 'Support Hours',
      value: 'Phone: 9 AM - 6 PM (Mon-Sat)',
      action: null,
      actionIcon: null,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearHeader title="Support Center" />

        {/* Contact Info Section with Icon Buttons */}
        <View style={styles.contactInfoContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactInfoCard}>
            {contactInfoItems.map((item) => (
              <View key={item.id} style={styles.contactInfoItem}>
                <View style={styles.contactInfoLeft}>
                  <View style={styles.contactInfoIconContainer}>
                    {item.icon}
                  </View>
                  <View style={styles.contactInfoContent}>
                    <Text style={styles.contactInfoLabel}>{item.label}</Text>
                    <Text style={styles.contactInfoValue}>{item.value}</Text>
                  </View>
                </View>
                
                {item.action && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={item.action}
                    activeOpacity={0.7}
                  >
                    {item.actionIcon}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contactInfoContainer: {
    marginBottom: 30,
    paddingHorizontal: 15,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#080808',
    marginBottom: 16,
  },
  contactInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactInfoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfoContent: {
    flex: 1,
  },
  contactInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  contactInfoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    lineHeight: 22,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  helpGuideContainer: {
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  helpGuideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  }
});

export default SupportScreen;